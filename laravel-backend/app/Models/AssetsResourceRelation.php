<?php

namespace App\Models;

use Nicolaslopezj\Searchable\SearchableTrait;
use Illuminate\Database\Eloquent\Model;


class AssetsResourceRelation extends Model
{
    use SearchableTrait;
    protected $searchable = [
        'columns' => [
            'assets_resources_relations.assets_vehicle_id' => 1,
            'assets_resources_relations.assets_resource_id' => 20,
            'assets_resources_relations.created_at' => 50,
            'assets_resources_relations.updated_at' => 20,
        ],
    ];

    protected $table = 'assets_resources_relations';

    protected $fillable = ['assets_vehicle_id', 'assets_resource_id', 'created_at', 'updated_at'];
}
