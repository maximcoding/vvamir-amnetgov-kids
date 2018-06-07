<?php

namespace App\Http\Controllers;

use App\Models\Role_user;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Role;
use App\Models\User;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Facades\JWTAuth;
use Log;

class AuthenticateController extends Controller
{

    public function authenticate(Request $request)
    {
        $permissions = array();
        $credentials = $request->only('email', 'password');
        try {
            // verify the credentials and create a token for the user
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(['error' => 'Invalid Credentials'], 401);
            }
        } catch (JWTException $e) {
            // something went wrong
            return response()->json(['error' => 'could_not_create_token'], 500);
        }
        $role = DB::table('role_user')->where('user_id', Auth::user()->id)->first();
        $role = Role::find($role->role_id);
        $user = Auth::user();
        DB::table('users')->where('id', Auth::user()->id)->update(['remember_token' => $token, 'last_token_time' => Carbon::now()]);
        //   Log::info("User :{ $user->id } Generated token is: ".json_encode(compact('token')));
        $temp = $role->perms()->get()->lists('name');
        foreach ($temp as $value) {
            $permissions[] = $value;
        }
        $coversations = DB::table('chat_conversations')->where('topic', '=', Auth::user()->organization_id)->get();
        $user->permissions = $permissions;
        $user->conversations = $coversations;
        return response()->json(compact('token', 'user'));
    }

}
