<?php

namespace App\Http\Controllers;

use App\Models\AssetsResourceRelation;
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

class AssetsResourceRelationController extends Controller
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

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $per_page = \Request::get('per_page') ?: 10;
        if ($request->asset_type) {
            switch ($request->asset_type) {
                case 'assets_vehicles':
                    return AssetsResourceRelation
                        ::leftJoin('assets_resources', 'assets_resources.id', '=', 'assets_resources_relations.assets_resource_id')
                        ->leftJoin('assets_categories', 'assets_resources.assets_category_id', '=', 'assets_categories.id')
                        ->select(
                            'assets_resources.*',
                            'assets_resources_relations.assets_vehicle_id',
                            'assets_resources_relations.assets_resource_id',
                            'assets_categories.name AS assets_category_name',
                            'assets_categories.id AS assets_category_id')
                        ->where('assets_resources_relations.assets_vehicle_id', '=', $request->asset_id)->get();
                case 'assets_persons':
                    return AssetsResourceRelation
                        ::leftJoin('assets_resources', 'assets_resources.id', '=', 'assets_resources_relations.assets_resource_id')
                        ->leftJoin('assets_categories', 'assets_resources.assets_category_id', '=', 'assets_categories.id')
                        ->select(
                            'assets_resources.*',
                            'assets_resources_relations.assets_person_id',
                            'assets_resources_relations.assets_resource_id',
                            'assets_categories.name AS assets_category_name',
                            'assets_categories.id AS assets_category_id')
                        ->where('assets_resources_relations.assets_person_id', '=', $request->asset_id)->get();
            }
        }
        if (Auth::user()->hasRole('administrators')) {
            /*
               SELECT assets_resources_relations.assets_vehicle_id,assets_resources_relations.assets_person_id,assets_resources.*
               FROM assets_resources_relations
               LEFT JOIN assets_resources
               ON assets_resources.id = assets_resources_relations.assets_resource_id
               LEFT JOIN assets_categories
               ON assets_resources.assets_category_id = assets_categories.id
            */
            return AssetsResourceRelation
                ::leftJoin('assets_resources', 'assets_resources.id', '=', 'assets_resources_relations.assets_resource_id')
                ->leftJoin('assets_categories', 'assets_resources.assets_category_id', '=', 'assets_categories.id')
                ->select('assets_resources.*', 'assets_resources_relations.assets_vehicle_id', 'assets_resources_relations.assets_person_id',
                    'assets_categories.name AS assets_category_name', 'assets_categories.id AS assets_category_id')
                ->paginate($per_page);
        }
        if (Auth::user()->can('view_assetsvehicle_for_managers')) {
            return AssetsResourceRelation
                ::leftJoin('assets_resources', 'assets_resources.id', '=', 'assets_resources_relations.assets_resource_id')
                ->leftJoin('assets_categories', 'assets_resources.assets_category_id', '=', 'assets_categories.id')
                ->select('assets_resources.*', 'assets_resources_relations.assets_vehicle_id', 'assets_resources_relations.assets_person_id',
                    'assets_categories.name AS assets_category_name', 'assets_categories.id AS assets_category_id')
                ->where('assets_resources.organization_id', '=', Auth::user()->organization_id)
                ->paginate($per_page);
        }
        if (Auth::user()->can('view_assetsvehicle_for_users')) {
            return AssetsResourceRelation
                ::leftJoin('assets_resources', 'assets_resources.id', '=', 'assets_resources_relations.assets_resource_id')
                ->leftJoin('assets_categories', 'assets_resources.assets_category_id', '=', 'assets_categories.id')
                ->select(
                    'assets_resources.*',
                    'assets_categories.name AS assets_category_name', 'assets_categories.id AS assets_category_id')
                ->where('assets_persons.organization_id', '=', Auth::user()->organization_id)
                ->paginate($per_page);
        } else
            return response()->json(['error' => 'You not have permission'], 403);
    }

    public
    function search(Request $request)
    {
        $per_page = \Request::get('per_page') ?: 10;
        ### search
        if ($request['query']) {
            $assetsvehicleresource = AssetsVehicleResource::search($request['query'], null, false)->get();
            $page = $request->has('page') ? $request->page - 1 : 0;
            $total = $assetsvehicleresource->count();
            $assetsvehicleresource = $assetsvehicleresource->slice($page * $per_page, $per_page);
            $assetsvehicleresource = new \Illuminate\Pagination\LengthAwarePaginator($assetsvehicleresource, $total, $per_page);
            return $assetsvehicleresource;
        }
        return 'not found';
    }


    public
    function show($id)
    {
        $assetsvehicleresource = AssetsVehicleResource::find($id);
        return $assetsvehicleresource;
    }

    public
    function edit($id)
    {
        $assetsvehicleresourcePermission = AssetsVehicleResource::find($id);
        if ($assetsvehicleresourcePermission)
            return response()->json(['success' => $assetsvehicleresourcePermission], 200);
        else
            return response()->json(['error' => 'not found item'], 404);
    }

    public function update(Request $request, $id)
    {
        if (Auth::user()->can('edit_assetsvehicle')) {
            $validator = Validator::make($request->all(), [
            ]);
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 406);
            }
            $assetsVehicle = AssetsVehicleResource::find($id);
            if ($assetsVehicle) {
                $assetsVehicle->update($request->all());
                return response()->json(['success'], 200);
            } else
                return response()->json(['error' => 'not found item'], 404);
        } else
            return response()->json(['error' => 'You not have User'], 403);
    }

    public function store(Request $request)
    {
        $queryAddon = "";
        $preparedArray = array();
        if ($request->selected_persons) {
            /*       SELECT assets_resources.*,assets_resources_relations.assets_person_id
    FROM assets_resources
    LEFT JOIN assets_resources_relations
    ON assets_resources.id = assets_resources_relations.assets_resource_id
    WHERE assets_resources_relations.assets_person_id ='232' OR assets_resources_relations.assets_person_id='33'*/
            $query = "SELECT assets_resources_relations.assets_person_id,assets_resources.*
                      FROM assets_resources_relations
                      LEFT JOIN assets_resources
                      ON assets_resources.id = assets_resources_relations.assets_resource_id WHERE assets_resources_relations.asset_type='persons'";
            $queryAddon .= " AND (";
            $lastItem = $request->selected_persons[count($request->selected_persons) - 1];
            foreach ($request->selected_persons as $item) {
                $queryAddon .= "assets_resources_relations.assets_person_id = ?";
                array_push($preparedArray, $item['id']);
                if ($lastItem['id'] !== $item['id']) {
                    $queryAddon .= " OR ";
                }
            }
            $query .= $queryAddon . ") ORDER BY assets_resources_relations.assets_person_id";
            $data = DB::select($query, $preparedArray);
            return compact('data');
        }

        if ($request->selected_vehicles) {
            return AssetsResourceRelation
                ::leftJoin('assets_resources', 'assets_resources.id', '=', 'assets_resources_relations.assets_resource_id')
                ->leftJoin('assets_categories', 'assets_resources.assets_category_id', '=', 'assets_categories.id')
                ->select(
                    'assets_resources.*',
                    'assets_resources_relations.assets_person_id',
                    'assets_resources_relations.assets_resource_id',
                    'assets_categories.name AS assets_category_name',
                    'assets_categories.id AS assets_category_id')
                ->where('assets_resources_relations.assets_person_id', '=', $request->asset_id)->get();
        }

    }

    public function destroy($id)
    {
        $del_array = array();
        if (Auth::user()->can('delete_assetsvehicle')) {
            $temp = explode(",", $id);
            foreach ($temp as $val) {
                $assetsvehicleresource = AssetsVehicleResource::find($val);
                if ($assetsvehicleresource) {
                    $assetsvehicleresource->delete();
                    $del_array['deleted'][] = $val;
                } else
                    $del_array['not_deleted'][] = $val;
            }
            return response()->json(['success' => $del_array], 200);
        } else
            return response()->json(['error' => 'You not have permission'], 403);
    }
}
