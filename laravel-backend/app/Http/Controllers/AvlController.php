<?php

namespace App\Http\Controllers;

use Log;
use App\Models\Avl;
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
use Carbon\Carbon;

class AvlController extends Controller
{

    public function __construct()
    {
        // Apply the jwt.auth middleware to all methods in this controller
        // except for the authenticate method. We don't want to prevent
        // the user from retrieving their token if they don't already have it
        $this->middleware('jwt.auth', ['except' => ['authenticate']]);
    }

    /**
     * Display a listing of the resource.
     */

    public function index(Request $request)
    {
        /* $user = Auth::user();
         if ($user->hasRole('administrators')) {
             $orgs = json_decode($request['param']);
             if ($orgs != "") {
                 $query = "SELECT avls.resource_id AS avl_resource_id,avls.id AS avl_id ,avls.lat,avls.lng,avls.created_at,assets_resources.imei,assets_resources.serial,assets_resources.sim,
                          organizations.name AS organization_name,organizations.id AS organization_id,organizations.type AS organization_type,
                          assets_categories.name AS assets_category_name,assets_categories.id AS assets_category_id,
                          assets_persons.firstname AS assetsperson_firstname , assets_persons.lastname AS assetsperson_lastname,
                          assets_vehicles.plate AS assetsvehicle_plate ,assets_vehicles.model AS assetsvehicle_model
                          FROM avls
                          LEFT  JOIN assets_resources ON avls.resource_id = assets_resources.id
                          LEFT  JOIN organizations ON assets_resources.organization_id = organizations.id
                          LEFT  JOIN assets_resources_relations ON avls.resource_id = assets_resources_relations.assets_resource_id
                          LEFT  JOIN assets_vehicles ON assets_resources_relations.assets_vehicle_id = assets_vehicles.id
                          LEFT  JOIN assets_persons ON assets_resources_relations.assets_person_id = assets_persons.id
                          LEFT  JOIN assets_categories ON assets_categories.id = assets_resources.assets_category_id
                          LEFT  JOIN points_of_interests ON assets_persons.default_point_of_interest = points_of_interests.id
                          WHERE  avls.id IN (SELECT MAX(id) FROM avls GROUP BY resource_id)";
                 $orgs = json_decode($request['param']);
                 $queryAddon = " AND ( 1 = 1 ";
                 foreach ($orgs as $organization) {
                     $queryAddon .= " OR assets_resources.organization_id = '" . $organization->id . "'";
                 }
                 $queryAddon .= " )";
                 $query .= $queryAddon;
             } else {
                 $query = "SELECT avls.resource_id AS avl_resource_id,avls.id AS avl_id ,avls.lat,avls.lng,avls.created_at,assets_resources.imei,assets_resources.serial,assets_resources.sim,
                          organizations.name AS organization_name,organizations.id AS organization_id,organizations.type AS organization_type,
                          assets_categories.name AS assets_category_name,assets_categories.id AS assets_category_id,
                          assets_persons.firstname AS assetsperson_firstname , assets_persons.lastname AS assetsperson_lastname,
                          assets_vehicles.plate AS assetsvehicle_plate ,assets_vehicles.model AS assetsvehicle_model
                          FROM avls
                          LEFT  JOIN assets_resources ON avls.resource_id = assets_resources.id
                          LEFT  JOIN organizations ON assets_resources.organization_id = organizations.id
                          LEFT  JOIN assets_resources_relations ON avls.resource_id = assets_resources_relations.assets_resource_id
                          LEFT  JOIN assets_vehicles ON assets_resources_relations.assets_vehicle_id = assets_vehicles.id
                          LEFT  JOIN assets_persons ON assets_resources_relations.assets_person_id = assets_persons.id
                          LEFT  JOIN assets_categories ON assets_categories.id = assets_resources.assets_category_id
                          LEFT  JOIN points_of_interests ON assets_persons.default_point_of_interest = points_of_interests.id
                          WHERE  avls.id IN (SELECT MAX(id) FROM avls GROUP BY resource_id)";
             }
             $data = DB::select($query);
             return compact('data');
         }
         if ($user->can('view_avls_for_managers')) {
             $query = "SELECT avls.resource_id AS avl_resource_id,avls.id AS avl_id ,avls.lat,avls.lng,avls.created_at,assets_resources.imei,assets_resources.serial,assets_resources.sim,
                          organizations.name AS organization_name,organizations.id AS organization_id,organizations.type AS organization_type,
                          assets_categories.name AS assets_category_name,assets_categories.id AS assets_category_id,
                          assets_persons.firstname AS assetsperson_firstname , assets_persons.lastname AS assetsperson_lastname,
                          assets_vehicles.plate AS assetsvehicle_plate ,assets_vehicles.model AS assetsvehicle_model
                          FROM avls
                          LEFT  JOIN assets_resources ON avls.resource_id = assets_resources.id
                          LEFT  JOIN organizations ON assets_resources.organization_id = organizations.id
                          LEFT  JOIN assets_resources_relations ON avls.resource_id = assets_resources_relations.assets_resource_id
                          LEFT  JOIN assets_vehicles ON assets_resources_relations.assets_vehicle_id = assets_vehicles.id
                          LEFT  JOIN assets_persons ON assets_resources_relations.assets_person_id = assets_persons.id
                          LEFT  JOIN assets_categories ON assets_categories.id = assets_resources.assets_category_id
                          LEFT  JOIN points_of_interests ON assets_persons.default_point_of_interest = points_of_interests.id
                          WHERE avls.id IN (SELECT MAX(id) FROM avls GROUP BY resource_id) AND organizations.id=? ";
             $data = DB::select($query, [$user->organization_id]);
             return compact('data');
         }
         if ($user->can('view_avls_for_users')) {
             $query = "SELECT avls.resource_id AS avl_resource_id,avls.id AS avl_id ,avls.lat,avls.lng,avls.created_at,assets_resources.imei,assets_resources.serial,assets_resources.sim,
                          organizations.name AS organization_name,organizations.id AS organization_id,organizations.type AS organization_type,
                          assets_categories.name AS assets_category_name,assets_categories.id AS assets_category_id,
                          assets_persons.firstname AS assetsperson_firstname , assets_persons.lastname AS assetsperson_lastname,
                          assets_vehicles.plate AS assetsvehicle_plate ,assets_vehicles.model AS assetsvehicle_model
                          FROM avls
                          LEFT  JOIN assets_resources ON avls.resource_id = assets_resources.id
                          LEFT  JOIN organizations ON assets_resources.organization_id = organizations.id
                          LEFT  JOIN assets_resources_relations ON avls.resource_id = assets_resources_relations.assets_resource_id
                          LEFT  JOIN assets_vehicles ON assets_resources_relations.assets_vehicle_id = assets_vehicles.id
                          LEFT  JOIN assets_persons ON assets_resources_relations.assets_person_id = assets_persons.id
                          LEFT  JOIN assets_categories ON assets_categories.id = assets_resources.assets_category_id
                          LEFT  JOIN points_of_interests ON assets_persons.default_point_of_interest = points_of_interests.id
                          WHERE avls.id IN (SELECT MAX(id) FROM avls GROUP BY resource_id)
                          AND assets_persons.id IN (SELECT assets_person_id FROM assets_groups_details WHERE assets_group_id IN (SELECT assets_group_id FROM users_watch_groups WHERE user_id =? ))";
             $data = DB::select($query, [$user->id]);
             return compact('data');
         } else {
             return response()->json(['error' => 'You not have permission'], 403);
         }*/
    }

    /*SELECT organizations.name AS organization_name,organizations.id AS organization_id,organizations.type AS organization_type
             FROM avls
             LEFT  JOIN assets_resources ON avls.resource_id = assets_resources.id
             LEFT  JOIN organizations ON assets_resources.organization_id = organizations.id
             WHERE  organizations.name LIKE  'Za' OR  organizations.name  LIKE  'Za % ' OR organizations.name LIKE ' % Za % '*/
    public function search(Request $request)
    {
        if (preg_match('/^[a-z0-9 .\-]+$/i', $request['query'])) {
            $data = DB::select(
                "SELECT DISTINCT organizations.name AS organization_name,organizations.id AS organization_id,organizations.type AS organization_type
                     FROM avls  
                     LEFT  JOIN assets_resources ON avls.resource_id = assets_resources.id 
                     LEFT  JOIN organizations ON assets_resources.organization_id = organizations.id 
                     WHERE  organizations.name ILIKE ? OR organizations.name ILIKE ?", [$request['query'] . '%', '%' . $request['query'] . '%']);
            return compact('data');
        }
        return 'not found';
    }


    public function store(Request $request)
    {

        if (empty($request->to_date) || empty($request->from_date)) {
            $today = Carbon::today()->subSecond();
            $yesterday = Carbon::yesterday()->subSecond();
            $today = $today->toDateTimeString();
            $yesterday = $yesterday->toDateTimeString();
            $request->from_date = $yesterday;
            $request->to_date = $today;
        }


        if (is_array($request->to_date) && is_array($request->from_date)) {
            //[2016,8,25,12,48,0]
            $request->to_date = Carbon::create($request->to_date[0], $request->to_date[1], $request->to_date[2], $request->to_date[3], $request->to_date[4], $request->to_date[5]);
            $request->from_date = Carbon::create($request->from_date[0], $request->from_date[1], $request->from_date[2], $request->from_date[3], $request->from_date[4], $request->from_date[5]);
        }


        $any_flag = 0;
        $preparedArray = array();
        $defaultQuery = "SELECT avls.resource_id AS avl_resource_id,avls.id AS avl_id ,avls.lat,avls.lng,avls.created_at,
                         assets_resources.imei,assets_resources.serial,assets_resources.sim,
                         organizations.name AS organization_name,organizations.id AS organization_id,organizations.type AS organization_type,
                         assets_persons.firstname AS assetsperson_firstname , assets_persons.lastname AS assetsperson_lastname,
                         assets_vehicles.plate AS assetsvehicle_plate ,assets_vehicles.model AS assetsvehicle_model,
                         assets_resources.assets_category_id AS assets_category_id
                         FROM avls  
                         LEFT  JOIN assets_resources ON avls.resource_id = assets_resources.id 
                         LEFT  JOIN organizations ON assets_resources.organization_id = organizations.id 
                         LEFT  JOIN assets_resources_relations ON avls.resource_id = assets_resources_relations.assets_resource_id
                         LEFT  JOIN assets_vehicles ON assets_resources_relations.assets_vehicle_id = assets_vehicles.id 
                         LEFT  JOIN assets_persons ON assets_resources_relations.assets_person_id = assets_persons.id";

        $queryAddon = " WHERE avls.created_at BETWEEN '$request->from_date' AND '$request->to_date' ";


        // addon for organizations
        if (count($request->organizations) > 0) {
            $any_flag = 1;
            $queryAddon .= " AND ( ";
            $arrayKeys = array_keys($request->organizations);
            $lastArrayKey = array_pop($arrayKeys);
            // Iterate selected organizations
            foreach ($request->organizations as $k => $v) {
                $queryAddon .= "organizations.id = ? ";
                array_push($preparedArray, $v['id']);
                if ($lastArrayKey != $k) {
                    $queryAddon .= " OR ";
                }
            }
        }
        if ($any_flag) {
            $any_flag = 0;
            $queryAddon .= ")";
        }

        // addon for assets_categories
        if (count($request->assets_categories) > 0) {
            $any_flag = 1;
            $has_vehicles = 1;
            $queryAddon .= " AND (";
            $lastAsset = $request->assets_categories[count($request->assets_categories) - 1];
            // Iterate selected assets
            foreach ($request->assets_categories as $asset) {
                $queryAddon .= "assets_resources.assets_category_id = ? ";
                array_push($preparedArray, $asset['id']);
                if ($lastAsset['id'] !== $asset['id']) {
                    $queryAddon .= " OR ";
                }
            }
        }
        if ($any_flag) {
            $any_flag = 0;
            $queryAddon .= ")";
        }

        // addon for assets_vehicles
        if (count($request->assets_vehicles) > 0) {
            $any_flag = 1;
            $queryAddon .= " AND ( ";
            $lastAsset = $request->assets_vehicles[count($request->assets_vehicles) - 1];
            // Iterate selected assets
            foreach ($request->assets_vehicles as $asset) {
                $queryAddon .= "assets_vehicles.id = ? ";
                array_push($preparedArray, $asset['id']);
                if ($lastAsset['id'] !== $asset['id']) {
                    $queryAddon .= " OR ";
                }
            }
        }

        if ($any_flag && count($request->assets_persons) > 0) {
            $queryAddon .= " OR ";
        }
        if (!$any_flag) {
            $queryAddon .= " AND ( ";
        }


        // addon for assets_persons
        if (count($request->assets_persons) > 0) {
            $any_flag = 1;
            $lastAsset = $request->assets_persons[count($request->assets_persons) - 1];
            // Iterate selected assets
            foreach ($request->assets_persons as $asset) {
                $queryAddon .= "assets_persons.id = ? ";
                array_push($preparedArray, $asset['id']);
                if ($lastAsset['id'] !== $asset['id']) {
                    $queryAddon .= " OR ";
                }
            }
        }

        if ($any_flag) {
            $any_flag = 0;
            $queryAddon .= ")";
        }


        switch ($request->selected_params) {
            case 0: // Last Report as Default
                $queryAddon .= " AND avls.id IN (SELECT MAX(id) FROM avls GROUP BY resource_id)";
                break;
            case 1: // All Reports Between Dates
            case 3: // All Reports Between Dates
            case 5: // All Reports Between Dates
            case 7: // All Reports Between Dates (for track and real time)
                break;
        }
        $defaultQuery .= $queryAddon . " ORDER BY created_at";
        Log::debug($defaultQuery);
        $data = DB::select($defaultQuery, $preparedArray);
        return compact('data');

    }

}
