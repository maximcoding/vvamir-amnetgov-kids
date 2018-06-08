<?php

namespace App\Http\Controllers;

use App\Models\AssetsPerson;
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
use Illuminate\Pagination\LengthAwarePaginator;
use Log;
use App\Models\AssetsResourceRelation;

class AssetsPersonController extends Controller
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
        //  if (Auth::user()->can('view_user'))
        if (Auth::user()->hasRole('administrators')) {
            $organization_flag = 0;
            if ($request->organization_id) {
                $organization_flag = 1;
                $assets_persons = DB::table('assets_persons')
                    ->leftJoin('organizations', 'assets_persons.organization_id', '=', 'organizations.id')
                    ->leftJoin('points_of_interests', 'assets_persons.default_point_of_interest', '=', 'points_of_interests.id')
                    ->leftJoin('assets_categories', 'assets_persons.assets_category_id', '=', 'assets_categories.id')
                    ->select(
                        'assets_persons.*',
                        'assets_persons.created_at AS assets_persons_created_at',
                        'assets_persons.updated_at AS assets_persons_updated_at',
                        'assets_persons.id AS assets_person_id',
                        'assets_persons.phone AS assetsperson_phone',
                        'assets_persons.gender AS assetsperson_gender',
                        'assets_persons.id AS assets_resouce_id',
                        'organizations.name AS organization_name',
                        'organizations.id AS organization_id',
                        'assets_categories.name AS assets_category_name')
                    ->where('assets_persons.status', '<>', 2)
                    ->where('organizations.id', '=', $request->organization_id)
                    ->get();
            }
            if (!$organization_flag) {
                $assets_persons = DB::table('assets_persons')
                    ->leftJoin('organizations', 'assets_persons.organization_id', '=', 'organizations.id')
                    ->leftJoin('points_of_interests', 'assets_persons.default_point_of_interest', '=', 'points_of_interests.id')
                    ->leftJoin('assets_categories', 'assets_persons.assets_category_id', '=', 'assets_categories.id')
                    ->select(
                        'assets_persons.*',
                        'assets_persons.created_at AS assets_persons_created_at',
                        'assets_persons.updated_at AS assets_persons_updated_at',
                        'assets_persons.id AS assets_person_id',
                        'assets_persons.phone AS assetsperson_phone',
                        'assets_persons.gender AS assetsperson_gender',
                        'assets_persons.id AS assets_resouce_id',
                        'organizations.name AS organization_name',
                        'organizations.id AS organization_id',
                        'assets_categories.name AS assets_category_name')
                    ->where('assets_persons.status', '<>', 2)
                    ->orderBy('assets_persons.created_at', 'desc')
                    ->paginate($per_page);
            }
        }
        if (Auth::user()->can('view_assetsperson_for_managers')) {
            $assets_persons = DB::table('assets_persons')
                ->leftJoin('organizations', 'assets_persons.organization_id', '=', 'organizations.id')
                ->leftJoin('points_of_interests', 'assets_persons.default_point_of_interest', '=', 'points_of_interests.id')
                ->leftJoin('assets_categories', 'assets_persons.assets_category_id', '=', 'assets_categories.id')
                ->select(
                    'assets_persons.*',
                    'assets_persons.created_at AS assets_persons_created_at',
                    'assets_persons.phone AS assetsperson_phone',
                    'assets_persons.gender AS assetsperson_gender',
                    'assets_persons.id AS assets_person_id',
                    'assets_persons.id AS assets_resouce_id',
                    'organizations.name AS organization_name',
                    'organizations.id AS organization_id',
                    'assets_categories.name AS assets_category_name')
                ->where('assets_persons.status', '<>', 2)
                ->where('assets_persons.organization_id', '=', Auth::user()->organization_id)
                ->paginate($per_page);
        }
        if (Auth::user()->can('view_assetsperson_for_users')) {
            $assets_persons = DB::table('assets_persons')
                ->leftJoin('organizations', 'assets_persons.organization_id', '=', 'organizations.id')
                ->leftJoin('points_of_interests', 'assets_persons.default_point_of_interest', '=', 'points_of_interests.id')
                ->leftJoin('assets_categories', 'assets_persons.assets_category_id', '=', 'assets_categories.id')
                ->leftJoin('assets_groups', 'assets_groups.organization_id', '=', 'organizations.id')
                ->leftJoin('users_watch_groups', 'users_watch_groups.assets_group_id', '=','assets_groups.id')
                ->leftJoin('assets_groups_details', 'assets_groups_details.assets_group_id', '=', 'users_watch_groups.id')
                ->where('users_watch_groups.user_id', '=', Auth::user()->id)
                ->where('assets_persons.id', '<>', 2)
                ->select(
                    'assets_persons.*',
                    'assets_persons.created_at AS assets_persons_created_at',
                    'assets_persons.phone AS assetsperson_phone',
                    'assets_persons.gender AS assetsperson_gender',
                    'assets_persons.id AS assets_person_id',
                    'assets_persons.id AS assets_resouce_id',
                    'organizations.name AS organization_name',
                    'organizations.id AS organization_id',
                    'assets_categories.name AS assets_category_name')
                ->paginate($per_page);
            Log::debug($assets_persons);
        }
        if (count($assets_persons) > 0) {
            foreach ($assets_persons as $person) {
                $person->person_resources = AssetsResourceRelation
                    ::leftJoin('assets_resources', 'assets_resources.id', '=', 'assets_resources_relations.assets_resource_id')
                    ->leftJoin('assets_categories', 'assets_resources.assets_category_id', '=', 'assets_categories.id')
                    ->select(
                        'assets_resources.*',
                        'assets_resources_relations.assets_person_id',
                        'assets_resources_relations.assets_resource_id',
                        'assets_categories.name AS assets_category_name',
                        'assets_categories.id AS assets_category_id')
                    ->where('assets_resources_relations.assets_person_id', '=', $person->assets_person_id)->get();
            }
            return $assets_persons;
        } else
            return response()->json(['error' => 'You not Permissions to view this content'], 403);
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
            $assetsperson = AssetsPerson::search($request['query'], null, false)->get();
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
    public
    function store(Request $request)
    {
        if ($request->update) {
            return $this->customUpdate($request);
        }
        if (Auth::user()->can('add_assetsperson')) {
            if ($request) {
                $validator = Validator::make($request->all(), [
                    'firstname' => 'required|min:3',
                    'lastname' => 'required|min:3',
                    'organization_id' => 'required',
                    'assets_category_id' => 'required',
                    'card_id' => 'required',
                    'phone' => 'required'
                ]);
                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 406);
                }
                $person = AssetsPerson::create($request->all());
                if ($request->selected_resources) {
                    foreach ($request->selected_resources as $resource) {
                        DB::insert('insert into assets_resources_relations (asset_type,assets_person_id,assets_resource_id,imei)
                                     values (?,?,?,?)',
                            ['persons', $person->id, $resource['id'], ""]);
                    }
                }
                return response()->json(['success'], 200);
            } else {
                return response()->json(['error' => 'can not save product'], 401);
            }
        } else
            return response()->json(['error' => 'You not have permission'], 403);
    }

    /**
     * Display the specified resource.
     */
    public
    function show($id)
    {
        $Person = AssetsPerson::find($id);
        if ($Person)
            return response()->json(['success' => $Person], 200);
        else
            return response()->json(['error' => 'not found item'], 404);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public
    function edit($id)
    {
        $resource = AssetsPerson::find($id);
        return $resource;
    }

    /**
     * Update the specified resource in storage.
     */
    private
    function customUpdate(Request $request)
    {


        if (Auth::user()->can('edit_assetsperson')) {
            $validator = Validator::make($request->all(), [
                'card_id' => 'required|min:2',
                'phone' => 'required',
                'firstname' => 'required',
                'lastname' => 'required'
            ]);
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 406);
            }

            $assetsperson = AssetsPerson::find($request->id);

            if ($assetsperson) {
                if ($request->activate) {
                    return $this->activate($request->id);
                }
                if ($request->selected_resources) {
                    $match_this = array('assets_person_id' => $assetsperson->id);
                    $status = DB::table('assets_resources_relations')->where($match_this)->delete();
                    foreach ($request->selected_resources as $resource) {
                        DB::insert('insert into assets_resources_relations (asset_type,assets_person_id,assets_resource_id)
                                     values (?,?,?)',
                            ['persons', $assetsperson->id, $resource['id']]);
                    }
                }
                return response()->json(['success'], 200);
            } else
                return response()->json(['error' => 'not found item'], 404);
        } else
            return response()->json(['error' => 'You not have User'], 403);
    }

    private
    function activate($id)
    {
        $person = AssetsPerson::find($id);
        if (!$person->status) {
            $affected = DB::table('assets_persons')->where('id', $id)->update(array('status' => 1));
        } else if ($person->status) {
            $affected = DB::table('assets_persons')->where('id', $id)->update(array('status' => 0));
        }
        if ($affected) {
            return response()->json(['success'], 200);
        } else {
            return response()->json(['error' => 'status not updated'], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     */

    public
    function destroy($id)
    {
        $del_array = array();
        if (Auth::user()->can('delete_assetsperson')) {
            $temp = explode(",", $id);
            foreach ($temp as $val) {
                $object = AssetsPerson::find($val);
                if ($object) {
                    AssetsPerson::where('id', $val)->update(['status' => 2]);
                    //     DB::table('assets_persons')->where('id', '=', $val)->update(['status' => 2]);
                    $del_array['deleted'][] = $val;
                } else
                    $del_array['not_deleted'][] = $val;
            }
            return response()->json(['success' => $del_array], 200);
        } else
            return response()->json(['error' => 'You not have permission'], 403);
    }


}
