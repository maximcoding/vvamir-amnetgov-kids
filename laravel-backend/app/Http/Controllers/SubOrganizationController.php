<?php

namespace App\Http\Controllers;

use App\Models\SubSubOrganization;
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

class SubOrganizationController extends Controller
{
    /**
     *  JWT Auth exception
     */
    public function __construct()
    {
        // Apply the jwt.auth middleware to all methods in this controller
        // except for the authenticate method. We don't want to prevent
        // the user from retrieving their token if they don't already have it
        $this->middleware('jwt.auth', ['except' => ['authenticate']]);
    }


    public function index()
    {

        //  return  DB::table('suborganizations')->where('organization_id', '=', Auth::user()->organization_id)->paginate(15);
        $per_page = \Request::get('per_page') ?: 10;
        //  if (Auth::user()->can('view_user'))
        if (Auth::user()->hasRole('administrators')) {
            return DB::table('suborganizations')
                ->leftJoin('organizations', 'organizations.id', '=', 'suborganizations.id')
                ->select('organizations.*', 'suborganizations.organization_id')
                ->paginate($per_page);
            return DB::table('suborganizations')->get();
        } else if (Auth::user()->can('view_suborganization')) {
            return DB::table('suborganizations')->where('organization_id', '=', Auth::user()->organization_id)->paginate(15);
            //  return SubOrganization::where('organization_id', '=', Auth::user()->organization_id)->paginate(15);
        } else
            return response()->json(['error' => 'You not have User'], 403);

    }

    /*
     * Add custom search method
     *
     */
    public function search(Request $request)
    {
        $per_page = \Request::get('per_page') ?: 10;
        ### search
        if ($request['query']) {
            $organization = SubOrganization::search($request['query'], null, false)->get();
            $page = $request->has('page') ? $request->page - 1 : 0;
            $total = $organization->count();
            $organization = $organization->slice($page * $per_page, $per_page);
            $organization = new \Illuminate\Pagination\LengthAwarePaginator($organization, $total, $per_page);
            return $organization;
        }
        return 'not found';
    }


    public function store(Request $request)
    {
        //    if (Auth::user()->can('add_suborganization')) {
        if (Auth::user()->hasRole('administrators')) {
            if ($request) {
                $validator = Validator::make($request->all(), [
                ]);
                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 406);
                }
                // DELETE BEFORE UPDATE NEW
                //     DB::table('suborganizations')->where('organization_id', '=', Auth::user()->organization_id)->delete();
                // STORE AGAIN AFTER DELETE

                DB::table('suborganizations')->where('organization_id', '=', $request->elements[0]['organization_id'])->delete();
                //DB::delete('delete * from suborganizations where organization_id=?',$request->elements[0]['organization_id']);
                foreach ($request->elements as $element) {
                    DB::insert('insert into suborganizations (organization_id,id,name,type)
                                values (?,?,?,?)',
                        [
                            $element['organization_id'],
                            $element['id'],
                            $element['name'],
                            $element['type']]);
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
        $orgs = DB::table('suborganizations')->where('organization_id', '=', $id)->get();
        return $orgs;
    }

    public function edit($id)
    {
        $orgPermission = SubOrganization::find($id);
        if ($orgPermission)
            return response()->json(['success' => $orgPermission], 200);
        else
            return response()->json(['error' => 'not found item'], 404);
    }

    public function update(Request $request, $id)
    {
        if (Auth::user()->can('edit_suborganization')) {
            $validator = Validator::make($request->all(), [
                'name' => 'required|min:6',
            ]);
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 406);
            }
            $org = SubOrganization::find($id);
            if ($org) {
                $org->update($request->all());
                return response()->json(['success'], 200);
            } else
                return response()->json(['error' => 'not found item'], 404);
        } else
            return response()->json(['error' => 'You not have User'], 403);
    }

    public function destroy($id)
    {
        $del_array = array();
        if (Auth::user()->can('delete_suborganization')) {
            $temp = explode(",", $id);
            foreach ($temp as $val) {
                $org = SubOrganization::find($val);
                if ($org) {
                    $org->delete();
                    $del_array['deleted'][] = $val;
                } else
                    $del_array['not_deleted'][] = $val;
            }
            return response()->json(['success' => $del_array], 200);
        } else
            return response()->json(['error' => 'You not have permission'], 403);
    }

}
