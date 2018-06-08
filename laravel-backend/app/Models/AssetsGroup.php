<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class AssetsGroup extends Model
{
    protected $table = 'assets_groups';
    protected $fillable = ['name','description','organization_id','created_by','status','created_at','updated_at'];
}
