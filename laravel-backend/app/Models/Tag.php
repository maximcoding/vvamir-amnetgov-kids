<?php

namespace App\Models;

use Nicolaslopezj\Searchable\SearchableTrait;
use Illuminate\Database\Eloquent\Model;


class Tag extends Model
{
    use SearchableTrait;
    protected $searchable = [
        'columns' => [
            'tags.tag' => 30,
         ]
    ];

    protected $table = 'tags';

    public function Task()
    {
        return $this->belongsToMany('App\Task','task_tags');
    }
    protected $fillable= ['tag'];
}
