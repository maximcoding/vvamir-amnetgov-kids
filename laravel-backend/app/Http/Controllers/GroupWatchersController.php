<?php

namespace App\Http\Controllers;


use App\Models\UsersWatchGroups;
use App\Models\AssetsGroupsDetails;
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
use App\Http\Controllers\AssetsGroupDetailsController;


class GroupWatchersController extends Controller
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
    public function index(Request $request)
    {
        $per_page = \Request::get('per_page') ?: 10;
        if ($request->group_id) {
            //  return UsersWatchGroups::where('assets_group_id','=',$request->group_id)->get
            if (Auth::user()->hasRole('administrators')) {
                return UsersWatchGroups::where('users_watch_groups.assets_group_id', '=', $request->group_id)->get();
            }
            if (Auth::user()->can('view_assetsperson')) {
                return DB::table('users_watch_groups')
                    ->leftJoin('assets_groups', 'users_watch_groups.assets_group_id', '=', 'assets_groups.id')
                    ->where('users_watch_groups.assets_group_id', '=', $request->group_id)
                    ->where('assets_groups.organization_id', '=', Auth::user()->organization_id)
                    ->get();
            }

            if (Auth::user()->can('view_assetsgroup_for_users')) {
                return UsersWatchGroups::where('users_watch_groups.assets_group_id', '=', $request->group_id)->
                where('users_watch_groups.user_id', '=', Auth::user()->id)->get();
            }

            if (Auth::user()->can('view_assetsgroup')) {
                return DB::table('users_watch_groups')
                    ->leftJoin('users', 'users_watch_groups.user_id', '=', 'users.id')
                    ->leftJoin('organizations', 'users.organization_id', '=', 'organizations.id')
                    ->select(
                        'users_watch_groups.assets_group_id',
                        'users.firstname AS watcher_firstname',
                        'users.lastname AS watcher_lastname',
                        'users.organization_id AS organization_id',
                        'organizations.name AS organization_name')
                    ->paginate($per_page);
            } else
                return response()->json(['error' => 'You not have permission'], 403);
        }

        if (Auth::user()->can('view_assetsperson')) {
            return DB::table('users_watch_groups')
                ->leftJoin('users', 'users_watch_groups.user_id', '=', 'users.id')
                ->leftJoin('organizations', 'users.organization_id', '=', 'organizations.id')
                ->select(
                    'users_watch_groups.assets_group_id',
                    'users.firstname AS watcher_firstname',
                    'users.lastname AS watcher_lastname',
                    'users.organization_id AS organization_id',
                    'organizations.name AS organization_name')
                ->paginate($per_page);
        }
  /*      if (Auth::user()->can('view_assetsgroup_for_managers')) {
            return DB::table('users_watch_groups')
                ->leftJoin('assets_groups', 'users_watch_groups.assets_group_id', '=', 'assets_groups.id')
                ->where('assets_groups.organization_id', '=', Auth::user()->organization_id)
                ->paginate($per_page);
        }

        if (Auth::user()->can('view_assetsgroup_for_users')) {
            return UsersWatchGroups::where('users_watch_groups.assets_group_id', '=', $request->group_id)->
            where('users_watch_groups.user_id', '=', Auth::user()->id)->get();
        }

        if (Auth::user()->can('view_assetsgroup')) {
            return DB::table('users_watch_groups')
                ->leftJoin('users', 'users_watch_groups.user_id', '=', 'users.id')
                ->leftJoin('organizations', 'users.organization_id', '=', 'organizations.id')
                ->select(
                    'users_watch_groups.assets_group_id',
                    'users.firstname AS watcher_firstname',
                    'users.lastname AS watcher_lastname',
                    'users.organization_id AS organization_id',
                    'organizations.name AS organization_name')
                ->paginate($per_page);
        }*/ else
            return response()->json(['error' => 'You not have permission'], 403);

    }


    /*
  * Add custom search method
  */
    public
    function search(Request $request)
    {
        $per_page = \Request::get('per_page') ?: 10;
        ### search
        if ($request['query']) {
            $groupwatcher = GroupWatchers::search($request['query'], null, false)->get();
            $page = $request->has('page') ? $request->page - 1 : 0;
            $total = $groupwatcher->count();
            $groupwatcher = $groupwatcher->slice($page * $per_page, $per_page);
            $groupwatcher = new \Illuminate\Pagination\LengthAwarePaginator($groupwatcher, $total, $per_page);
            return $groupwatcher;
        }
        return 'not found';
    }


    /**
     * Store a newly created resource in storage.
     */
    public
    function store(Request $request)
    {
        if ($request) {
            if ($request->group_id) {
                return GroupWatchersController::customUpdate($request);
            }
            if (Auth::user()->can('add_watchergroup')) {
                /*     $validator = Validator::make($request->all(), [
                      'group_name' => 'required|min:5',
                  ]);
                  if ($validator->fails()) {
                      return response()->json(['error' => $validator->errors()], 406);
                  }*/
                // DB::table('users_watch_groups')->where('assets_group_id', '=', $request->$element['assets_group_id'])->delete();
                //     UsersWatchGroups::insert($data); // Eloquent
                //    DB::table('table')->insert($data); // Query Builder
                /* INSERTING USERS AS WATCHERS TO THE GROUP*/
                /* INSERTING GROUP DETAILS*/
                foreach ($request->group_details as $kaka) {
                    DB::insert('insert into assets_groups_details (assets_person_id,assets_group_id) values (?,?)',
                        array($kaka['assets_person_id'], $kaka['assets_group_id']));
                }
                foreach ($request->watchers as $element) {
                    DB::insert('insert into users_watch_groups (user_id,assets_group_id)
                                     values (?,?)',
                        array($element['user_id'], $element['assets_group_id']));
                }
                //   AssetsGroupDetailsController::store($request);
                return response()->json(['success' => 'saved'], 200);
            } else {
                return response()->json(['error' => 'You not have permission'], 403);
            }
        } else
            return response()->json(['error' => 'can not save product'], 401);

    }


    /**
     * Display the specified resource.
     */
    public
    function show($id)
    {
        $resource = UsersWatchGroups::find($id);
        return $resource;
    }

    /**
     * Show the form for editing the specified resource.
     */
    public
    function edit($id)
    {
        $groupwatcherPermission = UsersWatchGroups::find($id);
        if ($groupwatcherPermission)
            return response()->json(['success' => $groupwatcherPermission], 200);
        else
            return response()->json(['error' => 'not found item'], 404);
    }

    /**
     * Update the specified resource in storage.
     */
    private
    function customUpdate(Request $request)
    {
        if (Auth::user()->can('edit_assetsgroup')) {
            //  UsersWatchGroups::where('assets_group_id', $request->group_id)->where('destination', 'San Diego')->update(['delayed' => 1]);
            $deletedRows = UsersWatchGroups::where('assets_group_id', $request->group_id)->delete();
            $deletedRows2 = AssetsGroupsDetails::where('assets_group_id', $request->group_id)->delete();
            /*UPDATE WATCHERS*/
            foreach ($request->watchers as $element) {
                DB::insert('
                            insert into users_watch_groups (user_id,assets_group_id)
                            values (?,?)',
                    array($element['user_id'], $element['assets_group_id']));
            }
            /*UPDATE GROUP DETAILS*/
            foreach ($request->group_details as $row) {
                DB::insert('insert into assets_groups_details (assets_person_id,assets_group_id)
                                        values (?,?)',
                    array($row['assets_person_id'], $row['assets_group_id']));
            }
            return response()->json(['success'], 200);

            //    return response()->json(['error' => 'not found item'], 404);
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
                $groupwatcher = UsersWatchGroups::find($val);
                if ($groupwatcher) {
                    $groupwatcher->delete();
                    $del_array['deleted'][] = $val;
                } else
                    $del_array['not_deleted'][] = $val;
            }
            return response()->json(['success' => $del_array], 200);
        } else
            return response()->json(['error' => 'You not have permission'], 403);
    }
}
