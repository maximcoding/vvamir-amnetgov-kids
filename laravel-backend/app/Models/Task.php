<?php

namespace App\Models;

use Nicolaslopezj\Searchable\SearchableTrait;
use Illuminate\Database\Eloquent\Model;


class Task extends Model
{
    use SearchableTrait;
    protected $searchable = [
        'columns' => [
            'tasks.title' => 30,
            'tasks.description' => 40,
            'users.opened_by' => 50,
            'categories.name' => 50,
        ],
        'joins' => [
            'users' => ['users.id','tasks.user_id'],
            'categories' => ['categories.id','tasks.category_id'],
        ],
    ];

    protected $table = 'tasks';


    public function User()
    {
        return $this->belongsTo('App\Models\User');
    }
    public function Category()
    {
        return $this->belongsTo('App\Models\Category');
    }

    public function Comment()
    {
        return $this->hasMany('App\Models\Comment');
    }
    public function Tags()
    {
        return $this->belongsToMany('App\Models\Tag','task_tags');
    }

    public function Gallery()
    {
        return $this->hasMany('App\Models\Gallery');
    }

    protected $fillable= ['status','title', 'description', 'attach_url','start_date','end_date','start_time','end_time','status','opened_by','vehicle_id','driver_id','estimated_time','map_distance'];
}
