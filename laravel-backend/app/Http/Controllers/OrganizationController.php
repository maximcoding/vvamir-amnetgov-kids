<?php

namespace App\Http\Controllers;

use App\Models\Organization;
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
use App\Models\ChatConversation;

class OrganizationController extends Controller
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


    /* *
     * Display a listing of the resource.
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $per_page = \Request::get('per_page') ?: 15;
        //  if (Auth::user()->can('view_user'))
        if ($user->hasRole('administrators')) {
            if ($request->data) {
                //   return Organization::where('status', '!=', '2')->get();
                return DB::table('organizations')
                    ->orderBy('name', 'asc')
                    ->where('status', '!=', '2')
                    ->paginate($per_page);
            }
            return Organization
                ::orderBy('name', 'asc')
                ->where('status', '!=', '2')->paginate($per_page);
        }
        if (Auth::user()->can('view_organization_for_managers')) {
            return Organization::where('id', '=', $user->organization_id)->paginate($per_page);
        } else
            return response()->json(['error' => 'You not have User'], 403);

    }

    /*
     * Add custom search method
     *
     */

    public function search(Request $request)
    {
        $per_page = \Request::get('per_page') ?: 15;
        ### search
        if ($request['query']) {
            $organization = Organization::search($request['query'])->get();
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
        if (Auth::user()->hasRole('administrators')) {
            if ($request) {
                $validator = Validator::make($request->all(), [
                    'name' => 'unique:organizations|required',
                    'type' => 'required',
                ]);
                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 406);
                }
                $organization = Organization::create($request->all());
                // CREATE CHAT ORGANIZATION PUBLIC ROOM
                $data = array('about' => $organization->id, 'topic' => $organization->id, 'created_by' => Auth::user()->id);
                $conversation_id = ChatConversation::insertGetId($data);

                return response()->json(['success'], 200);
            } else {
                return response()->json(['error' => 'can not save product'], 401);
            }
        } else
            return response()->json(['error' => 'You not have permission'], 403);
    }


    public function show($id)
    {
        $org = Organization::find($id);
        return $org;
    }


    public function edit($id)
    {
        $orgPermission = Organization::find($id);
        if ($orgPermission)
            return response()->json(['success' => $orgPermission], 200);
        else
            return response()->json(['error' => 'not found item'], 404);
    }


    public function update(Request $request, $id)
    {
        if (Auth::user()->hasRole('administrators') || Auth::user()->can('view_organization_for_managers')) {
            $validator = Validator::make($request->all(), [
                'name' => 'required',
            ]);
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 406);
            }
            $org = Organization::find($id);
            if ($org) {
                $affected = $org->update($request->all());
                if ($affected) {
                    return response()->json(['success'], 200);
                }
                return response()->json(['error' => 'item not updated'], 406);
            } else
                return response()->json(['error' => 'not found item'], 404);
        } else
            return response()->json(['error' => 'You not have User'], 403);

    }

    public function activate(Request $request)
    {
        $org = Organization::find($request->id);
        if (!$org->status) {
            $affected = DB::table('organizations')->where('id', $request->id)->update(array('status' => 1));
        }
        if ($org->status) {
            $affected = DB::table('organizations')->where('id', $request->id)->update(array('status' => 0));
        }
        if ($affected) {
            return response()->json(['success'], 200);
        } else {
            return response()->json(['error' => 'status not updated'], 404);
        }
    }

    public function destroy($id)
    {
        $del_array = array();
        if (Auth::user()->hasRole('administrators')) {
            $temp = explode(",", $id);
            foreach ($temp as $val) {
                $org = Organization::find($val);
                if ($org) {
                    Organization::where('id', $val)->update(['status' => 2]);
                    $del_array['deleted'][] = $val;
                } else
                    $del_array['not_deleted'][] = $val;
            }
            return response()->json(['success' => $del_array], 200);
        } else
            return response()->json(['error' => 'You not have permission'], 403);
    }


}
