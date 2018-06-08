<?php

namespace App\Http\Controllers;

use App\Models\Points;
use Illuminate\Http\Request;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Role_user;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Validator;

class PointsController extends Controller
{

    /*
     *
     *   JWT Auth exception
     *
     */
    public function __construct()
    {
        // Apply the jwt.auth middleware to all methods in this controller
        $this->middleware('jwt.auth', ['except' => ['authenticate']]);
    }

    public function index()
    {
        $per_page = \Request::get('per_page') ?: 10;
        if (Auth::user()->hasRole('administrators')) {
            return DB::table('points_of_interests')
                ->leftJoin('organizations', 'points_of_interests.organization_id', '=', 'organizations.id')
                ->select('points_of_interests.*', 'organizations.name AS organization_name')
                ->where('points_of_interests.status', '<>', 2)
                ->paginate($per_page);
        }
        if (Auth::user()->can('view_point')) {
            return DB::table('points_of_interests')
                ->leftJoin('organizations', 'points_of_interests.organization_id', '=', 'organizations.id')
                ->select('points_of_interests.*', 'organizations.name AS organization_name')
                ->where('points_of_interests.organization_id', '=', Auth::user()->organization_id)
                ->where('points_of_interests.status', '<>', 2)
                ->paginate($per_page);
        } else
            return response()->json(['error' => 'You not have permission'], 403);
    }

    /*
* Add custom search method
*/
    public function search(Request $request)
    {
        $per_page = \Request::get('per_page') ?: 10;
        ### search
        if ($request['query']) {
            $points = Points::search($request['query'], null, false)->get();
            $page = $request->has('page') ? $request->page - 1 : 0;
            $total = $points->count();
            $points = $points->slice($page * $per_page, $per_page);
            $points = new \Illuminate\Pagination\LengthAwarePaginator($points, $total, $per_page);
            return $points;
        }
        return 'not found';
    }


    public function store(Request $request)
    {
        if ($request->delete) {
            return $this->destroy($request);
        }
        if (Auth::user()->can('add_point')) {
            if ($request->data) {
                foreach ($request->data as $element) {
                    DB::insert('insert into points_of_interests (name,address,lat,lng,description,organization_id,marker_icon)
                                     values (?,?,?,?,?,?,?)',
                        array(
                            $element['name'],
                            $element['address'],
                            $element['lat'],
                            $element['lng'],
                            $element['description'],
                            Auth::user()->organization_id,
                            $element['marker_icon']));
                }
                return response()->json(['success'], 200);
            } else {
                return response()->json(['error' => 'can not save product'], 401);
            }
        } else
            return response()->json(['error' => 'You not have permission'], 403);
    }

    public function show($id)
    {
        return DB::table('points_of_interests')->where('id', '=', $id)->get();
    }

    public function edit($id)
    {
        $points = Points::find($id);
        if ($points)
            return response()->json(['success' => $points], 200);
        else
            return response()->json(['error' => 'not found item'], 404);
    }


    public function update(Request $request, $id)
    {
        if (Auth::user()->can('edit_point')) {
            $validator = Validator::make($request->all(), [
                'name' => 'required|min:6',
            ]);
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 406);
            }
            $points = Points::find($id);
            if ($points) {
                $points->update($request->all());
                return response()->json(['success'], 200);
            } else
                return response()->json(['error' => 'not found item'], 404);
        } else
            return response()->json(['error' => 'You not have User'], 403);
    }

    /*    public function destroy(Request $request)
        {
            $del_array = array();
            if (Auth::user()->can('delete_point')) {
                foreach ($request->delete as $val) {
                    $points = DB::table('points_of_interests')->find($val);
                    if ($points) {
                        //   DB::table('points_of_interests')->where('id', $points->id)->delete();
                        DB::table('points_of_interests')->where('id', $val)->update(['status' => 2]);
                        $del_array['deleted'][] = $val;
                    } else
                        $del_array['not_deleted'][] = $val;
                }
                return response()->json(['success' => $del_array], 200);
            } else
                return response()->json(['error' => 'You not have permission'], 403);
        }*/


    public
    function destroy($id)
    {
        $del_array = array();
        if (Auth::user()->can('delete_point')) {
            $temp = explode(",", $id);
            foreach ($temp as $val) {
                $object = DB::table('points_of_interests')->find($val);
                if ($object) {
                    DB::table('points_of_interests')->where('id', $val)->update(['status' => 2]);
                    //   DB::table('points_of_interests')->where('id', '=', $val)->delete();
                    $del_array['deleted'][] = $val;
                } else
                    $del_array['not_deleted'][] = $val;
            }
            return response()->json(['success' => $del_array], 200);
        } else
            return response()->json(['error' => 'You not have permission'], 403);
    }
}
