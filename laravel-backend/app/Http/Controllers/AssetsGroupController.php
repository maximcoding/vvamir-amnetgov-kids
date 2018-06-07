<?php

namespace App\Http\Controllers;


use App\Models\AssetsGroup;
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


class AssetsGroupController extends Controller
{
    /**
     *  JWT Auth exception
     */
    public function __construct()
    {
        // Apply the jwt.auth middleware to all methods in this controller
        $this->middleware('jwt.auth', ['except' => ['authenticate']]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $per_page = \Request::get('per_page') ?: 10;
        if (Auth::user()->hasRole('administrators')) {
            return DB::table('assets_groups')
                ->leftJoin('organizations', 'organizations.id', '=', 'assets_groups.organization_id')
                ->select(
                    'assets_groups.*',
                    'assets_groups.id AS assets_group_id',
                    'organizations.name AS organization_name',
                    'organizations.id AS organization_id')->where('assets_groups.status', '<>', 2)
                ->paginate($per_page);
        }
        if (Auth::user()->can('view_assetsgroup_for_managers')) {
            return DB::table('assets_groups')
                ->leftJoin('organizations', 'organizations.id', '=', 'assets_groups.organization_id')
                ->select(
                    'assets_groups.*',
                    'assets_groups.id AS assets_group_id',
                    'organizations.name AS organization_name', 'organizations.id AS organization_id')
                ->where('assets_groups.organization_id', '=', Auth::user()->organization_id)
                ->where('assets_groups.status', '<>', 2)
                ->paginate($per_page);
        }
        if (Auth::user()->can('view_assetsgroup_for_users')) {
            return DB::table('assets_groups')
                ->leftJoin('users_watch_groups', 'users_watch_groups.assets_group_id', '=', 'assets_groups.id')
                ->leftJoin('organizations', 'organizations.id', '=', 'assets_groups.organization_id')
                ->select(
                    'assets_groups.*',
                    'assets_groups.id AS assets_group_id',
                    'organizations.name AS organization_name', 'organizations.id AS organization_id')
                ->where('users_watch_groups.user_id', '=', Auth::user()->id)->where('assets_groups.status', '<>', 2)
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
            $assetsperson = AssetsGroup::search($request['query'], null, false)->get();
            $page = $request->has('page') ? $request->page - 1 : 0;
            $total = $assetsperson->count();
            $assetsperson = $assetsperson->slice($page * $per_page, $per_page);
            $assetsperson = new \Illuminate\Pagination\LengthAwarePaginator($assetsperson, $total, $per_page);
            return $assetsperson;
        }
        return 'not found';
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if ($request) {
            if (Auth::user()->can('add_assetsgroup')) {
                /*     $validator = Validator::make($request->all(), [
                      'group_name' => 'required|min:5',
                  ]);
                  if ($validator->fails()) {
                      return response()->json(['error' => $validator->errors()], 406);
                  }*/
                // DB::table('assets_groups')->where('organization_id', '=', $request->elements[0]['organization_id'])->delete();
                if (!Auth::user()->hasRole('administrators')) {
                    $request->organization_id = Auth::user()->organization_id;
                }
                $id = DB::table('assets_groups')->insertGetId(array('name' => $request->group_name, 'organization_id' => $request->organization_id, 'created_by' => Auth::user()->id));
                return $id;
            } else
                return response()->json(['error' => 'You not have permission'], 403);
        } else {
            return response()->json(['error' => 'can not save product'], 401);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $group = AssetsGroup::find($id);
        if ($group) {
            return $group;
        } else
            return response()->json(['error' => 'not found item'], 404);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $group = AssetsGroup::find($id);
        if ($group) {
            return DB::table('assets_groups')
                ->leftJoin('organizations', 'organizations.id', '=', 'assets_groups.organization_id')
                ->select(
                    'assets_groups.*',
                    'organizations.name AS organization_name', 'organizations.id AS organization_id')
                ->where('assets_groups.id', '=', $id);
        } else
            return response()->json(['error' => 'not found item'], 404);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        if (Auth::user()->can('edit_assetsgroup')) {
            $validator = Validator::make($request->all(), [
                'name' => 'required|min:6',
            ]);
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 406);
            }
            $assetsperson = AssetsGroup::find($id);
            if ($assetsperson) {
                $assetsperson->update($request->all());
                return response()->json(['success'], 200);
            } else
                return response()->json(['error' => 'not found item'], 404);
        } else
            return response()->json(['error' => 'You not have User'], 403);
    }

    public function customUpdate(Request $request)
    {
        if (Auth::user()->can('edit_assetsgroup')) {
            $group = AssetsGroup::find($request->id);
            if ($group) {
                $validator = Validator::make($request->all(), [
                    'name' => 'required|min:3',
                ]);
                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 406);
                }
                AssetsGroup::where('id', $request->id)
                    ->update(['name' => $request->name]);
                return response()->json(['success'], 200);
            } else
                return response()->json(['error' => 'not found item'], 404);
        } else
            return response()->json(['error' => 'You not have User'], 403);
    }

    /**
     * Remove the specified resource from storage.
     */
    public
    function destroy($id)
    {
        $del_array = array();
        if (Auth::user()->can('delete_assetsgroup')) {
            $temp = explode(",", $id);
            foreach ($temp as $val) {
                $assetsperson = AssetsGroup::find($val);
                if ($assetsperson) {
                    $affected = AssetsGroup::where('id', $val)->update(['status' => 2]);
                    $del_array['deleted'][] = $val;
                } else
                    $del_array['not_deleted'][] = $val;
            }
            return response()->json(['success' => $del_array], 200);
        } else
            return response()->json(['error' => 'You not have permission'], 403);
    }

}
