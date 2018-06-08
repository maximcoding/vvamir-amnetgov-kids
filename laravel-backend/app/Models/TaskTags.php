<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class TaskTags extends Model
{

    protected $table = 'task_tags';

    protected $fillable= ['tag_id','task_id'];
//    public function Task()
//    {
//        return $this->belongsToMany('App\Task');
//    }
//    public function Tag()
//    {
//        return $this->belongsToMany('App\Tag');
//    }
}
