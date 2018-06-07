<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class SubOrganization extends Model
{
    protected $table = 'suborganizations';

    protected $fillable = ['organization_id', 'id', 'name', 'created_at', 'updated_at'];

}
