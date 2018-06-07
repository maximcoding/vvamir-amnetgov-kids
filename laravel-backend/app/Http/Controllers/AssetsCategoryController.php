<?php

namespace App\Http\Controllers;


use App\Models\AssetsCategory;
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


class AssetsCategoryController extends Controller
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
        /*     $per_page = \Request::get('per_page') ?: 10;
            if (Auth::user()->can('view_AssetsCategory')) {
                return AssetsCategory::paginate($per_page);
            } else
                return response()->json(['error' => 'You not have permission'], 403);*/
        $per_page = \Request::get('per_page') ?: 10;
        switch ($request->category) {
            case 'humans':
                return AssetsCategory::where('type', '=', $request->category)->paginate($per_page);
            case 'vehicles':
                return AssetsCategory::where('type', '=', $request->category)->paginate($per_page);
            case 'categories_types':
                /*SELECT assets_categories.type AS category_type FROM assets_categories GROUP BY assets_categories.type*/
                return DB::table('assets_categories')
                    ->select('assets_categories.type AS category_type')
                    ->groupBy('type')
                    ->paginate($per_page);
            case 'devices':
                return AssetsCategory::where('type', 'like','%'.$request->category)->paginate($per_page);
        }
        return AssetsCategory::paginate($per_page);
    }


    /*
  * Add custom search method
  */
    public function search(Request $request)
    {
        $per_page = \Request::get('per_page') ?: 10;
        ### search
        if ($request['query']) {
            $assetsperson = AssetsCategory::search($request['query'], null, false)->get();
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
        if (Auth::user()->can('add_AssetsCategory')) {
            if ($request) {
                $validator = Validator::make($request->all(), [
                    'name' => 'required|min:5',
                    'email' => 'unique:users,email|required|email',
                ]);
                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 406);
                }
                AssetsCategory::create($request->all());
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
    public function show($id)
    {
        $resource = AssetsCategory::find($id);
        return $resource;
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $assetspersonPermission = AssetsCategory::find($id);
        if ($assetspersonPermission)
            return response()->json(['success' => $assetspersonPermission], 200);
        else
            return response()->json(['error' => 'not found item'], 404);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        if (Auth::user()->can('edit_AssetsCategory')) {
            $validator = Validator::make($request->all(), [
                'name' => 'required|min:6',
            ]);
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 406);
            }
            $assetsperson = AssetsCategory::find($id);
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
    public function destroy($id)
    {
        $del_array = array();
        if (Auth::user()->can('delete_AssetsCategory')) {
            $temp = explode(",", $id);
            foreach ($temp as $val) {
                $assetsperson = AssetsCategory::find($val);
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
