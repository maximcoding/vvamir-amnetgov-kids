<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

use App\Http\Requests;
use Validator;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    public function __construct()
    {
        // Apply the jwt.auth middleware to all methods in this controller
        // except for the authenticate method. We don't want to prevent
        // the user from retrieving their token if they don't already have it
        $this->middleware('jwt.auth', ['except' => ['authenticate']]);
    }


    public function index()
    {
        $categories = Category::all();
        return $categories;
    }


    public function create()
    {

    }


    public function store(Request $request)
    {
        if(Auth::user()->can('add_category')) {
            if ($request) {
                $validator = Validator::make($request->all(), [
                    'name' => 'required|min:3',
                ]);
                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 406);
                }

                Category::create($request->all());
                return response()->json(['success'], 200);
            } else {
                return response()->json(['error' => 'can not save product'], 401);
            }
        }else{
            return response()->json(['error' =>'You not have permission'], 403);
        }

    }


    public function show($id)
    {
        //
    }


    public function edit($id)
    {
        //
    }


    public function update(Request $request, $id)
    {
        if(Auth::user()->can('edit_category')) {
            $validator = Validator::make($request->all(), [
                'name' => 'required|min:3',
            ]);
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 406);
            }

            $category = Category::find($id);
            if ($category) {
                $category->update($request->all());
                return response()->json(['success'], 200);
            } else
                return response()->json(['error' => 'not found item'], 404);
        } else{
            return response()->json(['error' =>'You not have permission'], 403);
        }
    }


    public function destroy($id)
    {
        if(Auth::user()->can('delete_category')) {
                $Customer = Category::find($id);
                $Customer->delete();
                 return response()->json(['success'], 200);
        } else
            return response()->json(['error' =>'You not have permission'], 403);
    }
}
