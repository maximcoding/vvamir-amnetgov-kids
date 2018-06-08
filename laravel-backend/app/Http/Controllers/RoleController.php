<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use App\Models\Role_user;
use Illuminate\Auth\Guard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Validator;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use App\Models\Organization;
use Log;

class RoleController extends Controller
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
     *
     * @return \Illuminate\Http\Response
     */

    public function search(Request $request)
    {
        $per_page = \Request::get('per_page') ?: 10;
        ### search
        if ($request['query']) {
            $Role = Role::search($request['query'], null, false)->get();
            $page = $request->has('page') ? $request->page - 1 : 0;
            $total = $Role->count();
            $Role = $Role->slice($page * $per_page, $per_page);
            $Role = new \Illuminate\Pagination\LengthAwarePaginator($Role, $total, $per_page);
            return $Role;
        }
        return 'not found';
    }


    public function index()
    {
        // FOR CHECKING
        // where('email', 'LIKE', '%test%')->get();
        // ->orWhere('roles.name','like',%organizations.name%);

        $per_page = \Request::get('per_page') ?: 10;
        //   $role = Role::find(Auth::user()->id);
        /*    switch ($role->name) {
                case 'administrators' :
                    return Role::paginate($per_page);
                    break;
                case 'co-managers' :
                    return Role::where('name', '<>', 'administrators')->paginate(15);
                default :
                    return response()->json(['error' => 'You not have Permissions'], 403);
            }*/
        $organization = Organization::find(Auth::user()->organization_id);

        if (Auth::user()->hasRole('administrators')) {
            return Role::paginate($per_page);
        }
        if (!Auth::user()->hasRole('administrators')) {
            return Role::where('name', '<>', 'administrators')->paginate($per_page);
        }
    }


    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public
    function create()
    {
        //
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
        if (Auth::user()->can('add_role')) {
            if ($request) {
                $validator = Validator::make($request->all(), [
                    'name' => 'unique:roles|required|min:6',
                    'display_name' => 'unique:roles|required|min:6',
                ]);
                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 406);
                }
                // Checking at least one permission selected
                $permission_found = false;
                if ($request->permission != '') {
                    foreach ($request->permission as $key => $val) {
                        if ($val) {
                            $permission_found = true;
                        }
                    }
                }
                if (!$permission_found) {
                    //Error - at least one permission not selected
                    return response()->json(['error' => $validator->errors()], 331);
                }
                if ($permission_found) {
                    $Role = Role::create($request->all());
                    foreach ($request->permission as $key => $val) {
                        $prem_id = permission::select('id')->where('name', $key)->lists('id')->toarray();;
                        $Role->attachPermission($prem_id[0]);
                    }
                }
                return response()->json(['success'], 200);
            } else {
                return response()->json(['error' => 'can not save product'], 401);
            }
        } else
            return response()->json(['error' => 'You not have Role'], 403);

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
        $perm_arr = array();
        $editRole = Role::find($id);
        $permisions = permission::select(['name', 'id'])->get()->toArray();
        foreach ($permisions as $val) {
            $user = DB::table('permission_role')->where('permission_id', $val['id'])->where('role_id', $id)->lists('role_id');
            if (count($user))
                $perm_arr[$val['name']] = 1;
            else
                $perm_arr[$val['name']] = 0;
        }
        if ($editRole) {
            $editRole->permission = $perm_arr;
            return $editRole;
        } else
            return response()->json(['error' => 'not found item'], 404);
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
        $perm_arr = array();
        $editRole = Role::find($id);
        $permisions = permission::select(['name', 'id'])->get()->toArray();
        foreach ($permisions as $val) {
            $user = DB::table('permission_role')->where('permission_id', $val['id'])->where('role_id', $id)->lists('role_id');
            if (count($user))
                $perm_arr[$val['name']] = 1;
            else
                $perm_arr[$val['name']] = 0;
        }
        if ($editRole) {
            $editRole->permission = $perm_arr;
            return $editRole;
        } else
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
        /**
         * in demo version you can't update default task manager user role.
         * in production you should remove it
         */
        if ($id == 1)
            return response()->json(['error' => 'You not have permission to edit this item in demo mode'], 403);

        if (Auth::user()->hasRole('administrators')) {
            $validator = Validator::make($request->all(), [
                'name' => 'required|min:6',
                'display_name' => 'required|min:6',
            ]);
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 406);
            }
            $Role = Role::find($id);
            if ($Role) {
                $Role->update($request->all());
                DB::table('permission_role')->where('role_id', $Role->id)->delete();
                foreach ($request->permission as $key => $val) {
                    if ($val) {
                        $prem_id = permission::select('id')->where('name', $key)->lists('id')->toarray();
                        if (count($prem_id))
                            $Role->attachPermission($prem_id[0]);
                    }
                    if (!$val) {

                    }
                }
                return response()->json(['success'], 200);
            } else
                return response()->json(['error' => 'not found item'], 404);
        } else
            return response()->json(['error' => 'You not have Role'], 403);
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
        if (Auth::user()->can('delete_role')) {
            $temp = explode(",", $id);
            foreach ($temp as $val) {
                // can't delete administrators or co-managers or co-users
                if ($id == 1 || $id == 2 || $id == 3) {
                    return response()->json(['error' => 'You not have permission to delete this item in demo mode'], 403);
                }
                $role = Role::find($val);
                $data = DB::select('SELECT * FROM role_user WHERE role_id=?', [$role->id]);
                if (sizeof($data) >= 1) {
                    return response()->json(['error' => 'Operation denied ! This Role in use .'], 403);
                }
                $role->delete();
            }
            return response()->json(['success'], 200);
        } else
            return response()->json(['error' => 'You not have this permission'], 403);
    }
}
