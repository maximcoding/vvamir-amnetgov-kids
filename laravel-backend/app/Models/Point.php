<?php

namespace App\Models;

use Nicolaslopezj\Searchable\SearchableTrait;
use Illuminate\Database\Eloquent\Model;


class Point extends Model
{

    protected $searchable = [
        'columns' => [
            'points_of_interests.name' => 255,
            'points_of_interests.lat' => 20,
            'points_of_interests.lng' => 20,
            'points_of_interests.address' => 50,
            'points_of_interests.description' => 20,
            'points_of_interests.status' => 100,
            'points_of_interests.created_at' => 100,
            'points_of_interests.updated_at' => 2,
        ],
    ];

    protected $table = 'points_of_interests';

    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $fillable = ['marker_color', 'marker_icon,', 'organization_id', 'name', 'lat', 'lng', 'address', 'description', 'status', 'created_at', 'updated_at'];
}
