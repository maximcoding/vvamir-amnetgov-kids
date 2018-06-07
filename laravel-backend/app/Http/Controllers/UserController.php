<?php

namespace App\Http\Controllers;


use App\Models\Role;
use App\Models\Role_user;
use App\Models\User;
use App\Models\Organization;
use App\Models\ChatConversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use File;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Validator;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Log;

class UserController extends Controller
{
    public function __construct()
    {
        // Apply the jwt.auth middleware to all methods in this controller
        // except for the authenticate method. We don't want to prevent
        // the user from retrieving their token if they don't already have it
        $this->middleware('jwt.auth', ['except' => ['authenticate']]);
    }


    /*
     * Export Excel Method
     */
    public function exportFile(Request $request)
    {


        ### $request['export_type'] is export mode  "EXCEL or CSV"
        ### Check export CSV permission
        if ($request['export_type'] == 'csv' && !Auth::user()->can('export_csv'))
            return 'You not have this permission';

        ### Check export EXCEL permission
        if ($request['export_type'] == 'xls' && !Auth::user()->can('export_xls'))
            return 'You not have this permission';


        ### record_type 1 equal whole records and 2 equals selected records
        if ($request['record_type'] == 1) {
            $users = User::all();
        } else if ($request['record_type'] == 2) {
//            return $request['selection'];
//            $temp = explode(",", $request['selection']);
            //        foreach($temp as $val) {
            //             $users = User::find($val);
//            }
            $users = User::findMany($request['selection']);
        }

        ###
        if ($request['export_type'] == 'pdf') { //export PDF
            $html = '<h1 style="text-align: center">YEP ngLaravel PDF </h1>';
            $html .= '<style> table, th, td {text-align: center;} th, td {padding: 5px;} th {color: #43A047;border-color: black;background-color: #C5E1A5} </style> <table border="2" style="width:100%;"> <tr> <th>Name</th> <th>Email</th> </tr>';
            foreach ($users as $user) {
                $html .= "<tr> <td>$user->name</td> <td>$user->email</td> </tr>";
            }
            $html .= '</table>';
            $pdf = App::make('dompdf.wrapper');
            $headers = array(
                'Content-Type: application/pdf',
            );
            $pdf->loadHTML($html);
            return $pdf->download('permission.pdf', $headers);
        } else {
            Excel::create('user', function ($excel) use ($users) {
                $excel->sheet('Sheet 1', function ($sheet) use ($users) {
                    $sheet->fromArray($users);
                });
            })->download($request['export_type']);
        }
    }


    /*
     *  Search Method
     */
    public function search(Request $request)
    {
        $per_page = \Request::get('per_page') ?: 10;
        ### search
        if ($request['query']) {
            //    $userFound = User::search($request['query'], null, true)->get();
            $userFound = User::search($request['query'], null, false)
                ->leftJoin('role_user', 'users.id', '=', 'role_user.user_id')
                ->leftJoin('roles', 'role_user.role_id', '=', 'roles.id')
                ->leftJoin('organizations', 'users.organization_id', '=', 'organizations.id')
                ->select('users.*', 'organizations.name AS organization_name', 'organizations.id AS organization_id', 'roles.name AS role_name')
                ->get();
            $page = $request->has('page') ? $request->page - 1 : 0;
            $total = $userFound->count();
            $userFound = $userFound->slice($page * $per_page, $per_page);
            $userFound = new \Illuminate\Pagination\LengthAwarePaginator($userFound, $total, $per_page);
            return $userFound;
        }
        return 'not found';
    }


    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {

        $per_page = \Request::get('per_page') ?: 10;
        // SUPER ADMIN
        if (Auth::user()->hasRole('administrators')) {
            if ($request->organization_id) {
                return DB::table('users')
                    ->leftJoin('role_user', 'users.id', '=', 'role_user.user_id')
                    ->leftJoin('roles', 'role_user.role_id', '=', 'roles.id')
                    ->leftJoin('organizations', 'users.organization_id', '=', 'organizations.id')
                    ->select('users.*', 'users.id as user_id', 'organizations.name AS organization_name', 'organizations.id AS organization_id', 'roles.name AS role_name')
                    ->where('organizations.id', '=', $request->organization_id)->get();
            }

            return DB::table('users')
                ->leftJoin('role_user', 'users.id', '=', 'role_user.user_id')
                ->leftJoin('roles', 'role_user.role_id', '=', 'roles.id')
                ->leftJoin('organizations', 'users.organization_id', '=', 'organizations.id')
                ->select('users.*', 'organizations.name AS organization_name', 'organizations.id AS organization_id', 'roles.name AS role_name')
                ->paginate($per_page);

        }
        //MANAGERS & USERS
        if (Auth::user()->can('view_user_for_managers') || Auth::user()->can('view_user_for_users')) {
            if ($request->organization_id) {
                return DB::table('users')
                    ->leftJoin('role_user', 'users.id', '=', 'role_user.user_id')
                    ->leftJoin('roles', 'role_user.role_id', '=', 'roles.id')
                    ->leftJoin('organizations', 'users.organization_id', '=', 'organizations.id')
                    ->select('users.*', 'users.id as user_id', 'organizations.name AS organization_name', 'organizations.id AS organization_id', 'roles.name AS role_name')
                    ->where('organizations.id', '=', $request->organization_id)->get();
            }

            //$data = DB::select('SELECT users.*,roles.name AS role_name,organizations.name AS organization_name,organizations.id AS organization_id FROM users JOIN role_user ON role_user.user_id = users.id JOIN roles ON role_user.role_id = roles.id JOIN organizations ON users.organization_id = organizations.id WHERE organizations.id =?', [$user->organization_id])->get();
            return DB::table('users')
                ->leftJoin('role_user', 'users.id', '=', 'role_user.user_id')
                ->leftJoin('roles', 'role_user.role_id', '=', 'roles.id')
                ->leftJoin('organizations', 'users.organization_id', '=', 'organizations.id')
                ->select('users.*', 'users.id as user_id', 'organizations.name AS organization_name', 'organizations.id AS organization_id', 'roles.name AS role_name', 'roles.id AS role_id')
                ->where('organizations.id', '=', Auth::user()->organization_id)
                ->paginate($per_page);
        } else
            return response()->json(['error' => 'You not have User'], 403);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public
    function store(Request $request)
    {
        $user = Auth::user();
        if ($user->can('add_user')) {
            if ($request) {
                $validator = Validator::make($request->all(), [
                    'firstname' => 'required|min:3',
                    'lastname' => 'required|min:3',
                    'phone' => 'required',
                    'email' => 'unique:users,email|required|email',
                    'password' => 'required|min:6',
                    'confirm_password' => 'required|min:6',
                    'role_id' => 'required',
                    'organization_id' => 'required',
                ]);
                if ($request->password != $request->confirm_password) {
                    return response()->json(['error' => 'Confirm password does not match'], 332);
                }
                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 406);
                }
                ###  upload avatar
                if (file_exists("temp/" . $request['avatar_url']) && $request['avatar_url'] != '') {
                    File::move("temp/" . $request['avatar_url'], "uploads/" . $request['avatar_url']);
                }
                ####
                $request['password'] = bcrypt($request['password']);
                $user = User::create($request->all());
                DB::table('users')->where('id', $user->id)->update(array('last_message_time' => Carbon::now()));
                DB::insert('insert into role_user (user_id, role_id) values (?, ?)', [$user->id, $request['role_id']]);
                //ADD USER TO PUBLIC ROOM
                $room_match_this = array('about' => $user->organization_id, 'topic' => $user->organization_id);
                $conversation = ChatConversation::where($room_match_this)->first();
                DB::insert('insert into chat_conversations_participants (participant_id,conversation_id) values (?,?)', array($user->id, $conversation->id));

                return response()->json(['success'], 200);
            } else {
                return response()->json(['error' => 'can not save product'], 401);
            }
        } else
            return response()->json(['error' => 'You not have User'], 403);

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
        if ($id == 0) {
            return User::find(Auth::user()->id);
        }
        $User = User::find($id);
        $role_id = DB::table('role_user')->select('role_id')->where('user_id', $id)->lists('role_id');
        $User->role_id = $role_id[0];
        if ($User)
            return $User;
        else
            return response()->json(['error' => 'not found item'], 404);
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show_profile(Request $request)
    {
        //SELECT * FROM users
        //LEFT JOIN
        //role_user ON users.id = role_user.user_id
        //LEFT JOIN
        //roles ON roles.id = role_user.role_id
        //LEFT JOIN
        //organizations
        //ON users.organization_id = organizations.id
        $User = DB::table('users')
            ->leftJoin('role_user', 'role_user.user_id', '=', 'users.id')
            ->leftJoin('roles', 'role_user.role_id', '=', 'roles.id')
            ->leftJoin('organizations', 'users.organization_id', '=', 'organizations.id')
            ->select('users.*', 'organizations.name AS organization_name', 'organizations.id AS organization_id', 'roles.name AS role_name')
            ->where('users.id', '=', $request->user_id)
            ->get();
        if ($User)
            return $User;
        else
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
        $editUser = User::find($id);
        if ($editUser)
            return response()->json(['success' => $editUser], 200);
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
        /**
         * in demo version you can't delete default task manager user permission.
         * in production you should remove it
         */
        //   if ($id == 1)
        //       return response()->json(['error' => 'You not have permission to edit this item in demo mode'], 403);

        if (Auth::user()->can('edit_user')) {
            $validator = Validator::make($request->all(), [
                'firstname' => 'required|min:3',
                'lastname' => 'required|min:3',
                'email' => 'required|email',
                'password' => 'required|min:6',
                'role_id' => 'required',
            ]);
            if ($request->password != $request->confirm_password) {
                return response()->json(['error' => $validator->errors()], 332);
            }
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 406);
            }
            ###  upload avatar
            if (file_exists("temp/" . $request['avatar_url']) && $request['avatar_url'] != '') {
                File::move("temp/" . $request['avatar_url'], "uploads/" . $request['avatar_url']);
            }
            ####
            $User = User::find($id);
            DB::table('role_user')->where('user_id', $User->id)->delete();
            DB::insert('insert into role_user (user_id, role_id) values (?, ?)', [$User->id, $request['role_id']]);
            if ($request['password'] != '********')
                $request['password'] = bcrypt($request['password']);
            else
                $request['password'] = $User->password;
            if ($User) {
                $User->update($request->all());
                return response()->json(['success'], 200);
            } else
                return response()->json(['error' => 'not found item'], 404);
        } else
            return response()->json(['error' => 'You not have User'], 403);
    }

    public
    function update_time_message(Request $request)
    {
        if ($request->user_id) {
            $User = User::find($request->user_id);
            if ($User)
                $affected = DB::table('users')->where('id', $User->id)->update(array('last_message_time' => Carbon::now()));
            return $affected;
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
        if (Auth::user()->can('delete_user')) {
            $temp = explode(",", $id);
            foreach ($temp as $val) {
                /**
                 * in demo version you can't delete default task manager user permission.
                 * in production you should remove it
                 */
                if ($val == 1 || $val == Auth::user()->id)
                    return response()->json(['error' => 'You not have permission to delete this item in demo mode'], 403);
                $User = User::find($val);
                $User->delete();
            }
            return response()->json(['success'], 200);
        } else
            return response()->json(['error' => 'You not have User'], 403);
    }
}
