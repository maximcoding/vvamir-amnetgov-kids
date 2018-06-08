<?php

namespace App\Models;

use Nicolaslopezj\Searchable\SearchableTrait;
use Illuminate\Database\Eloquent\Model;


class Category extends Model
{
    use SearchableTrait;
    protected $searchable = [
        'columns' => [
            'categories.name' => 12,
            'categories.description' => 7,
        ],
    ];
    public function Task()
    {
        return $this->hasMany('App\Task');
    }

    protected $fillable = [
        'name','description'
    ];
}
