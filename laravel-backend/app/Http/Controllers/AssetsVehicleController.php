<?php

namespace App\Http\Controllers;

use App\Models\AssetsVehicle;
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
use App\Models\AssetsResourceRelation;
use Log;

class AssetsVehicleController extends Controller
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
        if (Auth::user()->hasRole('administrators')) {
            $organization_flat = 0;
            if ($request->organization_id) {
                $organization_flat = 1;
                $asset_vehicles = DB::table('assets_vehicles')
                    ->leftJoin('organizations', 'assets_vehicles.organization_id', '=', 'organizations.id')
                    ->leftJoin('points_of_interests', 'assets_vehicles.night_parking_lot', '=', 'points_of_interests.id')
                    ->leftJoin('assets_categories', 'assets_vehicles.assets_category_id', '=', 'assets_categories.id')
                    ->select(
                        'assets_vehicles.*',
                        'organizations.name AS organization_name', 'organizations.id AS organization_id',
                        'assets_categories.name AS assets_category_name', 'assets_categories.id AS assets_category_id')
                    ->where('assets_vehicles.status', '<>', 2)
                    ->where('assets_vehicles.organization_id', '=', $request->organization_id)
                    ->get();
            }
            /*
              SELECT
              assets_vehicles.*,
              organizations.name AS organization_name,organizations.id AS organization_id
              FROM assets_vehicles
              LEFT JOIN organizations ON assets_vehicles.organization_id = organizations.id
              LEFT JOIN points_of_interests ON assets_vehicles.night_parking_lot = points_of_interests.id
            */
            if (!$organization_flat) {
                $asset_vehicles = DB::table('assets_vehicles')
                    ->leftJoin('organizations', 'assets_vehicles.organization_id', '=', 'organizations.id')
                    ->leftJoin('points_of_interests', 'assets_vehicles.night_parking_lot', '=', 'points_of_interests.id')
                    ->leftJoin('assets_categories', 'assets_vehicles.assets_category_id', '=', 'assets_categories.id')
                    ->select(
                        'assets_vehicles.*',
                        'organizations.name AS organization_name', 'organizations.id AS organization_id',
                        'assets_categories.name AS assets_category_name', 'assets_categories.id AS assets_category_id')
                    ->where('assets_vehicles.status', '<>', 2)
                    ->paginate($per_page);
            }
        }

        if (Auth::user()->can('view_assetsvehicle_for_managers') || Auth::user()->can('view_assetsvehicle_for_users')) {
            $asset_vehicles = DB::table('assets_vehicles')
                ->leftJoin('organizations', 'assets_vehicles.organization_id', '=', 'organizations.id')
                ->leftJoin('points_of_interests', 'assets_vehicles.night_parking_lot', '=', 'points_of_interests.id')
                ->leftJoin('assets_categories', 'assets_vehicles.assets_category_id', '=', 'assets_categories.id')
                ->select(
                    'assets_vehicles.*',
                    'organizations.name AS organization_name', 'organizations.id AS organization_id',
                    'assets_categories.name AS assets_category_name', 'assets_categories.id AS assets_category_id')
                ->where('assets_vehicles.status', '<>', 2)
                ->where('assets_vehicles.organization_id', '=', Auth::user()->organization_id)->paginate($per_page);
        }

        if (count($asset_vehicles) > 0) {
            foreach ($asset_vehicles as $vehicle) {
                $vehicle->vehicle_resources = AssetsResourceRelation
                    ::leftJoin('assets_resources', 'assets_resources.id', '=', 'assets_resources_relations.assets_resource_id')
                    ->leftJoin('assets_categories', 'assets_resources.assets_category_id', '=', 'assets_categories.id')
                    ->select(
                        'assets_resources.*',
                        'assets_resources_relations.assets_vehicle_id',
                        'assets_resources_relations.assets_resource_id',
                        'assets_categories.name AS assets_category_name',
                        'assets_categories.id AS assets_category_id')
                    ->where('assets_resources_relations.assets_vehicle_id', '=', $vehicle->id)->get();
            }
            return $asset_vehicles;

        } else
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
            $assetsvehicle = AssetsVehicle::search($request['query'], null, false)->get();
            $page = $request->has('page') ? $request->page - 1 : 0;
            $total = $assetsvehicle->count();
            $assetsvehicle = $assetsvehicle->slice($page * $per_page, $per_page);
            $assetsvehicle = new \Illuminate\Pagination\LengthAwarePaginator($assetsvehicle, $total, $per_page);
            return $assetsvehicle;
        }
        return 'not found';
    }


    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public
    function store(Request $request)
    {
        if (Auth::user()->can('add_assetsvehicle')) {
            if ($request) {
                $validator = Validator::make($request->all(), [
                    'plate' => 'unique:assets_vehicles|required',
                    'organization_id' => 'required',
                    'assets_category_id' => 'required',
                    'model' => 'required',
                    'type' => 'required',
                    'passenger_cap' => 'required'
                ]);
                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 406);
                }
                $vehicle = AssetsVehicle::create($request->all());
                if ($request->selected_resources) {
                    foreach ($request->selected_resources as $resource) {
                        DB::insert('insert into assets_resources_relations (asset_type,assets_vehicle_id,assets_resource_id,imei)
                                     values (?,?,?,?)',
                            ['vehicles', $vehicle->id, $resource['id'], ""]);
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
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public
    function show($id)
    {
        $assetsvehicle = AssetsVehicle::find($id);
        return $assetsvehicle;
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public
    function edit($id)
    {
        $assetsvehiclePermission = AssetsVehicle::find($id);
        if ($assetsvehiclePermission)
            return response()->json(['success' => $assetsvehiclePermission], 200);
        else
            return response()->json(['error' => 'not found item'], 404);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public
    function update(Request $request, $id)
    {

        if (Auth::user()->can('edit_assetsvehicle')) {
            $validator = Validator::make($request->all(), [
            ]);
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 406);
            }
            $assetsVehicle = AssetsVehicle::find($id);

            if ($assetsVehicle) {
                if ($request->activate) {
                    return $this->activate($id);
                }
                $assetsVehicle->update($request->all());
                $match_this = array('assets_vehicle_id' => $assetsVehicle->id);
                $status = DB::table('assets_resources_relations')->where($match_this)->delete();
                foreach ($request->selected_resources as $resource) {
                    DB::insert('insert into assets_resources_relations (asset_type,assets_vehicle_id,assets_resource_id)
                                     values (?,?,?)',
                        ['vehicles', $assetsVehicle->id, $resource['id']]);
                }
                return response()->json(['success'], 200);
            } else
                return response()->json(['error' => 'not found item'], 404);
        } else
            return response()->json(['error' => 'You not have User'], 403);
    }

    private function activate($id)
    {
        $vehicle = AssetsVehicle::find($id);
        if (!$vehicle->status) {
            $affected = DB::table('assets_vehicles')->where('id', $id)->update(array('status' => 1));
        } else if ($vehicle->status) {
            $affected = DB::table('assets_vehicles')->where('id', $id)->update(array('status' => 0));
        }
        if ($affected) {
            return response()->json(['success'], 200);
        } else {
            return response()->json(['error' => 'status not updated'], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public
    function destroy($id)
    {
        $del_array = array();
        if (Auth::user()->can('delete_assetsvehicle')) {
            $temp = explode(",", $id);
            foreach ($temp as $val) {
                $assetsvehicle = AssetsVehicle::find($val);
                if ($assetsvehicle) {
                    AssetsVehicle::where('id', $val)->update(['status' => 2]);
                    //    DB::table('assets_vehicles')->where('id', '=', $val)->update(['status' => 2]);
                    $del_array['deleted'][] = $val;
                } else
                    $del_array['not_deleted'][] = $val;
            }
            return response()->json(['success' => $del_array], 200);
        } else
            return response()->json(['error' => 'You not have permission'], 403);
    }


}
