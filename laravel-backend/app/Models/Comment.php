<?php

namespace App\Models;

use Nicolaslopezj\Searchable\SearchableTrait;
use Illuminate\Database\Eloquent\Model;


class Comment extends Model
{
    use SearchableTrait;
    protected $searchable = [
        'columns' => [
            'comments.comment_text' => 30,
            'users.name' => 50,
            'tasks.name' => 50,
        ],
        'joins' => [
            'users' => ['users.id','comments.user_id'],
            'tasks' => ['tasks.id','comments.task_id'],
        ],
    ];
    public function User()
    {
        return $this->belongsTo('App\Models\User');
    }
    public function Tasks()
    {
        return $this->belongsTo('App\Task');
    }
    protected $fillable= ['comment_text'];
}
