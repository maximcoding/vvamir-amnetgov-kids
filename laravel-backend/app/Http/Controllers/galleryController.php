<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use App\Models\Task;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Validator;

class GalleryController extends Controller
{
    public function __construct()
    {
        // Apply the jwt.auth middleware to all methods in this controller
        // except for the authenticate method. We don't want to prevent
        // the user from retrieving their token if they don't already have it
        $this->middleware('jwt.auth', ['except' => ['authenticate']]);
    }

    public function search(Request $request)
    {
        $per_page = \Request::get('per_page') ?: 10;
        ### search
        if ($request['query']) {
            $request = Gallery::search($request['query'], null, false)->get();
            $page = $request->has('page') ? $request->page - 1 : 0;
            $total = $request->count();
            $request = $request->slice($page * $per_page, $per_page);
            $request = new \Illuminate\Pagination\LengthAwarePaginator($request, $total, $per_page);
            return  $request;
        }
        return 'not found';
    }


    public function index()
    {
        $per_page = \Request::get('per_page') ?: 10;

        if(Auth::user()->can('view_gallery'))
            return Gallery::paginate($per_page);
        else
            return response()->json(['error' =>'You not have Gallery'], 403);
    }

    public function store(Request $request)
    {
        if(Auth::user()->can('add_gallery')) {
            if ($request) {
                $validator = Validator::make($request->all(), [
                    'filename' => 'required|min:3',
                ]);
                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 406);
                }
                $Request=Gallery::create($request->all());

                $category = Task::find($request['task_id']);
                $category->Gallery()->save($Request);

                return response()->json(['success'], 200);
            } else {
                return response()->json(['error' => 'can not save product'], 401);
            }
        }else
            return response()->json(['error' =>'You not have Gallery'], 403);
    }


    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $Gallery = Gallery::find($id);
        return $Gallery;
    }


    public function edit($id)
    {
        $editGallery = Gallery::find($id);
        if($editGallery)
            return response()->json(['success'=>$editGallery], 200);
        else
            return response()->json(['error' => 'not found item'], 404);
    }


    public function update(Request $request, $id)
    {

        if(Auth::user()->can('edit_gallery')) {
            $validator = Validator::make($request->all(), [
                'filename' => 'required|min:6',

            ]);
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 406);
            }
            $Gallery = Gallery::find($id);
            if ($Gallery) {
                $Gallery->update($request->all());
                $category = Task::find($request['task_id']);
                $category->Gallery()->save($Gallery);
                return response()->json(['success'], 200);
            } else
                return response()->json(['error' => 'not found item'], 404);
        } else
            return response()->json(['error' =>'You not have update Gallery'], 403);
    }


    public function destroy($id)
    {
        if(Auth::user()->can('delete_gallery')) {
            $temp = explode(",", $id);
            foreach($temp as $val){
                $Gallery = Gallery::find($val);
                $Gallery->delete();
            }
            return response()->json(['success'], 200);
        } else
            return response()->json(['error' =>'You not have delete Gallery'], 403);
    }
}
