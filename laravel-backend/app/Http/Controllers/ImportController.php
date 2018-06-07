<?php

namespace App\Http\Controllers;

use App\admin\News;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use File;
use App\Http\Requests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Input;
use PhpSoft\Users\Controllers\UserController;


class ImportController extends Controller
{
    public function __construct()
    {
        // Apply the jwt.auth middleware to all methods in this controller
        // except for the authenticate method. We don't want to prevent
        // the user from retrieving their token if they don't already have it
        $this->middleware('jwt.auth', ['except' => ['authenticate']]);
    }

    public function importCSVEXCElDatabase(Request $request)
    {
        $insert_error='';
        $fail_counter = 0;
        $destinationPath = public_path() . '/temp/';

        $main_array = array_diff($request->all(), array('0'));   ### Get only select items
        if (!file_exists($destinationPath . $request['import_file_name']))
            return response()->json(['error' => 'File does not exist!'], 404);

        $success_counter = 0;
        $files = Excel::load($destinationPath . $request['import_file_name'], function ($reader) {  #### Read excel file
        })->toArray();

        foreach ($files as $rows) {    #### Sync fields and sheet items

            foreach ($rows as $key => $row) {

               foreach ($main_array as $main_key => $val) {
                   if($val == $key&&$main_key=='role' && Role::where('name',$row)->exists()){

                       $temp=Role::where('name',$row)->lists('id')->toarray();
                       $id=$temp[0];
                   }else if($val == $key&&$main_key=='role'){

                       $temp=Role::create(['name' => $row]);
                       $id=$temp->id;
                   }
                     if ($val == $key && $main_key=='role') {
                       $request['role_id'] = $id;
                   }else if ($val == $key){

                             $request[$main_key] = $row;
                     }

                }
            }
            if ($request && Auth::user()->can('add_user')) {
                $errors = app('App\Http\Controllers\UserController')->store($request);

                if (isset($errors->getData()->error)) {
                    $fail_counter++;
                    $insert_error = $errors->getData();
                } else if ($errors) {
                    $success_counter++;
                }


            }
        }

        #### delete file after import
         if (file_exists($destinationPath . $request['import_file_name']))   ####delete file after import
         File::delete($destinationPath . $request['import_file_name']);

        return response()->json(['insert_error'=>$insert_error,'success_counter'=>$success_counter,'fail_counter'=>$fail_counter],200);
    }


    public function importCSVEXCEl(Request $request)
    {
        $User=new User;
        //$fields = Schema::getColumnListing($request['module_name']); #### Get database fields
        $fields = $User->import_fields;; #### Get database fields
        $file = $request['file_name'];    #### Get file
        $destinationPath = public_path() . '/temp/';

        if ($destinationPath) {
            $import = Excel::load($destinationPath . '/' . $file, function ($reader) {   ###Read excel file
            })->toArray();

            foreach ($import[0] as $key => $val) {
                $columns[] = $key;
            }
            return response()->json(compact('columns', 'fields'));
        } else
            return 'Problem in import';
    }


    public function deleteCSVEXCEl(Request $request)
    {
        if (file_exists($request['id'])) {
            File::delete($request['id']); ####delete file
            return 1;
        }
    }
}
