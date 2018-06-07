<?php

namespace App\Models;



use Illuminate\Database\Eloquent\Model;


class permission_role extends model
{

    protected $table = 'permission_role';


    public function permission()
    {
        return $this->hasMany('App\Permission');
    }
}
