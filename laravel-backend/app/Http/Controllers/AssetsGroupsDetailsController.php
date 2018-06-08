<?php

namespace App\Http\Controllers;


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


class AssetsGroupsDetailsController extends Controller
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


        if ($request->group_id) {
            return DB::table('assets_groups_details')
                ->where('assets_group_id', '=', $request->group_id)
                ->get();
        }

        $per_page = \Request::get('per_page') ?: 10;
        /*
          SELECT assets_groups_details.assets_group_id,
          assets_persons.id AS assetsperson_id,assets_persons.firstname AS assetsperson_firstname,assets_persons.lastname AS assetsperson_lastname
          FROM assets_groups_details
          LEFT JOIN assets_persons ON assets_persons.id = assets_groups_details.assets_person_id

        */
        if (Auth::user()->can('view_assets_group_details')) {
            return DB::table('assets_groups_details')
                ->leftJoin('assets_persons', 'assets_persons.id', '=', 'assets_groups_details.assets_person_id')
                ->select(
                    'assets_groups_details.*',
                    'assets_persons.id AS AS asset_person_id',
                    'assets_persons.firstname AS asset_person_firstname',
                    'assets_persons.lastname AS asset_person_lastname'
                )
                ->paginate($per_page);
        }
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
            $assetsperson = AssetsGroupsDetails::search($request['query'], null, false)->get();
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
        if ($request) {
            /* INSERTING GROUP DETAILS*/
            foreach ($request->group_details as $row) {
                DB::insert('insert into assets_groups_details (assets_person_id,assets_group_id) values (?,?)',
                    array($row['assets_person_id'], $row['assets_group_id']));
            }
            return response()->json(['success' => 'saved'], 200);
        } else {
            return response()->json(['error' => 'can not save product'], 401);
        }
    }


    /**
     * Display the specified resource.
     */
    public
    function show($id)
    {
        $resource = AssetsGroupsDetails::find($id);
        return $resource;
    }

    /**
     * Show the form for editing the specified resource.
     */
    public
    function edit($id)
    {
        $assetspersonPermission = AssetsGroupsDetails::find($id);
        if ($assetspersonPermission)
            return response()->json(['success' => $assetspersonPermission], 200);
        else
            return response()->json(['error' => 'not found item'], 404);
    }

    /**
     * Update the specified resource in storage.
     */
    public
    function update(Request $request, $id)
    {
        if (Auth::user()->can('edit_assetsgroup')) {
            $validator = Validator::make($request->all(), [
                'name' => 'required|min:6',
            ]);
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 406);
            }
            $assetsperson = AssetsGroupsDetails::find($id);
            if ($assetsperson) {
                $assetsperson->update($request->all());
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
                $assetsperson = AssetsGroupsDetails::find($val);
                if ($assetsperson) {
                    $assetsperson->delete();
                    $del_array['deleted'][] = $val;
                } else
                    $del_array['not_deleted'][] = $val;
            }
            return response()->json(['success' => $del_array], 200);
        } else
            return response()->json(['error' => 'You not have permission'], 403);
    }
}
