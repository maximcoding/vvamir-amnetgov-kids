<?php

namespace App\Models;


use Zizaco\Entrust\EntrustRole;
use Nicolaslopezj\Searchable\SearchableTrait;
use Illuminate\Database\Eloquent\Model;


class role extends EntrustRole
{
    use SearchableTrait;
    protected $searchable = [
        'columns' => [
            'roles.name' => 100,
            'roles.description' => 100,
        ],
    ];

    protected $table = 'roles';

    public function role_user()
    {
        return $this->belongsTo('App\Models\Role_user');
    }
    protected $fillable = ['name','display_name', 'description'];
}
