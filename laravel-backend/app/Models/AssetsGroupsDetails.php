<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class AssetsGroupsDetails extends Model
{

    protected $table = 'assets_groups_details';
    protected $fillable = ['assets_person_id', 'assets_vehicle_id', 'assets_group_id'];

}
