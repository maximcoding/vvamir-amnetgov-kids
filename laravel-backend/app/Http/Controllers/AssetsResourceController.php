<?php

namespace App\Http\Controllers;

use App\Models\AssetsResource;
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

class AssetsResourceController extends Controller
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

    public function index(Request $request)
    {
        $per_page = \Request::get('per_page') ?: 10;

        if ($request->asset_id) {
            switch ($request->type) {
                case 'persons':
                    return DB::table('assets_resources')
                        ->leftJoin('assets_resources_relations', 'assets_resources_relations.assets_resource_id', '=', 'assets_resources.id')
                        ->leftJoin('assets_persons', 'assets_resources_relations.assets_resource_id', '=', 'assets_resources.id')
                        ->where('assets_persons.id', '=', $request->asset_id)
                        ->where('assets_resources.status', '<>', 2)
                        ->select('assets_resources.*')->get();
            }
        }
        if ($request->only_free_list) {
            switch ($request->assets_category_type) {
                case 'humans_devices':
                    $data = DB::select('
                                SELECT assets_resources.*,assets_resources.id::integer AS assets_resource_id,assets_categories.type,assets_categories.name AS assets_category_name FROM assets_resources
                                LEFT JOIN assets_categories
                                ON assets_resources.assets_category_id = assets_categories.id
                                WHERE assets_resources.organization_id =:org_id 
                                AND assets_resources.id NOT IN  ( SELECT assets_resource_id FROM assets_resources_relations WHERE  assets_resource_id IS NOT NULL)
                                AND assets_categories.type =:param2
                                ', ['org_id' => $request->organization_id, 'param2' => $request->assets_category_type]);
                    return compact('data');

                case 'vehicles_devices':
                    $data = DB::select('
                                SELECT assets_resources.*,assets_resources.id::integer AS assets_resource_id,assets_categories.type,assets_categories.name AS assets_category_name FROM assets_resources
                                LEFT JOIN assets_categories
                                ON assets_resources.assets_category_id = assets_categories.id
                                WHERE assets_resources.organization_id =:org_id 
                                AND assets_resources.id NOT IN  ( SELECT assets_resource_id FROM assets_resources_relations WHERE  assets_resource_id IS NOT NULL)
                                AND assets_categories.type =:param2
                                ', ['org_id' => $request->organization_id, 'param2' => $request->assets_category_type]);
                    return compact('data');

                case 'devices':
                    $data = DB::select("
                                SELECT assets_resources.*,assets_resources.id::integer AS assets_resource_id,assets_categories.type,assets_categories.name AS assets_category_name FROM assets_resources
                                LEFT JOIN assets_categories
                                ON assets_resources.assets_category_id = assets_categories.id
                                WHERE assets_resources.organization_id =? 
                                AND assets_resources.id NOT IN  ( SELECT assets_resource_id FROM assets_resources_relations WHERE assets_resource_id IS NOT NULL)
                                AND assets_categories.type LIKE '%devices'
                                ", [$request->organization_id]);
                    return compact('data');
            }
        }
        if (Auth::user()->hasRole('administrators')) {
            /*
                SELECT assets_resources.*,organizations.name AS organization_name,organizations.id AS organization_id ,
               assets_categories.name AS assets_category_name,
               assets_persons.firstname AS assets_persons_firstname,assets_persons.lastname AS assets_persons_lastname,
               assets_vehicles.plate AS assets_vehicles_plate,assets_vehicles.model AS assets_vehicles_model,
               assets_persons.card_id AS assets_persons_card,assets_persons.avatar_url AS assets_persons_avatar_url
               FROM assets_resources
               LEFT JOIN assets_categories
               ON assets_resources.assets_category_id = assets_categories.id
               LEFT JOIN organizations
               ON assets_resources.organization_id = organizations.id
               LEFT JOIN assets_resources_relations
               ON assets_resources_relations.assets_resource_id= assets_resources.id
               LEFT JOIN assets_persons
               ON assets_resources_relations.assets_person_id= assets_persons.id
               LEFT JOIN assets_vehicles
               ON assets_resources_relations.assets_vehicle_id= assets_vehicles.id
             * */
            return DB::table('assets_resources')
                ->leftJoin('assets_categories', 'assets_resources.assets_category_id', '=', 'assets_categories.id')
                ->leftJoin('organizations', 'assets_resources.organization_id', '=', 'organizations.id')
                ->leftJoin('assets_resources_relations', 'assets_resources_relations.assets_resource_id', '=', 'assets_resources.id')
                ->leftJoin('assets_vehicles', 'assets_resources_relations.assets_vehicle_id', '=', 'assets_vehicles.id')
                ->leftJoin('assets_persons', 'assets_resources_relations.assets_person_id', '=', 'assets_persons.id')
                ->select(
                    'assets_resources.*',
                    'assets_resources.id AS assets_resource_id',
                    'organizations.name AS organization_name', 'organizations.id AS organization_id',
                    'assets_categories.name AS assets_category_name',
                    'assets_persons.firstname AS assets_persons_firstname',
                    'assets_persons.lastname AS assets_persons_lastname',
                    'assets_persons.id AS assets_persons_id',
                    'assets_vehicles.id AS assets_vehicles_id',
                    'assets_vehicles.type AS assets_vehicles_type',
                    'assets_vehicles.plate AS assets_vehicles_plate',
                    'assets_vehicles.model AS assets_vehicles_model',
                    'assets_persons.card_id AS assets_persons_card',
                    'assets_persons.avatar_url AS assets_persons_avatar_url')
                ->where('assets_resources.status', '<>', 2)
                ->paginate($per_page);
        }
        if (Auth::user()->can('view_assetsresource')) {
            return DB::table('assets_resources')
                ->leftJoin('assets_categories', 'assets_resources.assets_category_id', '=', 'assets_categories.id')
                ->leftJoin('organizations', 'assets_resources.organization_id', '=', 'organizations.id')
                ->leftJoin('assets_resources_relations', 'assets_resources_relations.assets_resource_id', '=', 'assets_resources.id')
                ->leftJoin('assets_vehicles', 'assets_resources_relations.assets_vehicle_id', '=', 'assets_vehicles.id')
                ->leftJoin('assets_persons', 'assets_resources_relations.assets_person_id', '=', 'assets_persons.id')
                ->select(
                    'assets_resources.*',
                    'assets_resources.id AS assets_resource_id',
                    'organizations.name AS organization_name', 'organizations.id AS organization_id',
                    'assets_categories.name AS assets_category_name',
                    'assets_persons.firstname AS assets_persons_firstname',
                    'assets_persons.lastname AS assets_persons_lastname',
                    'assets_persons.id AS assets_persons_id',
                    'assets_vehicles.id AS assets_vehicles_id',
                    'assets_vehicles.type AS assets_vehicles_type',
                    'assets_vehicles.plate AS assets_vehicles_plate',
                    'assets_vehicles.model AS assets_vehicles_model',
                    'assets_persons.card_id AS assets_persons_card',
                    'assets_persons.avatar_url AS assets_persons_avatar_url')
                ->where('assets_resources.organization_id', '=', Auth::user()->organization_id)
                ->where('assets_resources.status', '<>', 2)
                ->paginate($per_page);
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
            $assetsresource = AssetsResource::search($request['query'], null, false)->get();
            $page = $request->has('page') ? $request->page - 1 : 0;
            $total = $assetsresource->count();
            $assetsresource = $assetsresource->slice($page * $per_page, $per_page);
            $assetsresource = new \Illuminate\Pagination\LengthAwarePaginator($assetsresource, $total, $per_page);
            return $assetsresource;
        }
        return 'not found';
    }


    public
    function store(Request $request)
    {
        $organization = "organization";
        $firstname = "firstname";
        $lastname = "lastname";

//        for ($indexx = 1002; $indexx < 5000; $indexx++) {
//            DB::insert('insert into organizations (name) values (?)', array($organization . ' ' . $indexx));
//        }

//        for ($indexx = 1111; $indexx < 5000; $indexx++) {
//            DB::insert('insert into assets_resources (imei,serial,organization_id,assets_category_id) values (?,?,?,?)',
//                array(str_random(), str_random(), $indexx, rand(2, 13)));
//        }

//        for ($indexx = 1111; $indexx < 5000; $indexx++) {
//            DB::insert('insert into assets_persons (firstname,lastname,organization_id,assets_category_id) values (?,?,?,?)',
//                array("firstname" . $indexx, "lastname" . $indexx, $indexx, rand(2, 13)));
//        }

//        for ($indexx = 10; $indexx < 5000; $indexx++) {
//            DB::insert('insert into assets_resources_relations (asset_type,assets_person_id,assets_resource_id) values (?,?,?)',
//                array("persons", $indexx, $indexx + 3));
//            usleep(30000);
//        }

//        for ($indexx = 10; $indexx < 5000; $indexx++) {
//            DB::insert('insert into avls (lat,lng,resource_id) values (?,?,?)', array(4 + rand(0, 1000000000) / 100000000, -72 + rand(0, 1000000000) / 100000000, $indexx));
//        }

//        for ($indexx; $indexx < 1000; $indexx++) {
//            DB::insert('insert into assets_resources (imei,serial) values (?,?)', array(51521251515123 + $indexx, 1132125151532 + $i));
//        }


        if (Auth::user()->can('add_assetsresource')) {
            if ($request) {
                $validator = Validator::make($request->all(), [
                    'imei' => 'unique:assets_resources',
                    'serial' => 'unique:assets_resources',
                ]);
                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 406);
                }
                AssetsResource::create($request->all());
                return response()->json(['success'], 200);
            } else {
                return response()->json(['error' => 'can not save product'], 401);
            }
        } else
            return response()->json(['error' => 'You not have permission'], 403);

    }


    public
    function show($id)
    {
        $resource = AssetsResource::find($id);
        return $resource;
    }

    public
    function edit($id)
    {
        $assetsresourcePermission = AssetsResource::find($id);
        if ($assetsresourcePermission)
            return response()->json(['success' => $assetsresourcePermission], 200);
        else
            return response()->json(['error' => 'not found item'], 404);
    }

    public
    function update(Request $request, $id)
    {
        if (Auth::user()->can('edit_assetsresource')) {
            $validator = Validator::make($request->all(), [
            ]);
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 406);
            }
            $assetsresource = AssetsResource::find($id);
            if ($assetsresource) {
                $assetsresource->update($request->all());
                return response()->json(['success'], 200);
            } else
                return response()->json(['error' => 'not found item'], 404);
        } else
            return response()->json(['error' => 'You not have User'], 403);
    }


    public
    function destroy($id)
    {
        $del_array = array();
        if (Auth::user()->hasRole('administrators')) {
            $temp = explode(",", $id);
            foreach ($temp as $val) {
                $object = AssetsResource::find($val);
                if ($object) {
                    AssetsResource::where('id', $val)->update(['status' => 2]);
                    //   DB::table('assets_resources')->where('id', '=', $val)->delete();
                    $del_array['deleted'][] = $val;
                } else
                    $del_array['not_deleted'][] = $val;
            }
            return response()->json(['success' => $del_array], 200);
        } else
            return response()->json(['error' => 'You not have permission'], 403);
    }


}
