<?php

namespace App\Models;

use Nicolaslopezj\Searchable\SearchableTrait;
use Illuminate\Database\Eloquent\Model;


class AssetsVehicle extends Model
{
    use SearchableTrait;
    protected $searchable = [
        'columns' => [
            'assetsvehicles.organization_id' => 1,
            'assetsvehicles.plate' => 20,
            'assetsvehicles.model' => 50,
            'assetsvehicles.type' => 20,
            'assetsvehicles.fuel_type' => 20,
            'assetsvehicles.mileage' => 100,
            'assetsvehicles.passenger_cap' => 100,
            'assetsvehicles.created_at' => 100,
            'assetsvehicles.updated_at' => 100,
        ],
    ];

    protected $table = 'assets_vehicles';

    protected $fillable = ['status','organization_id', 'plate', 'assets_category_id', 'model', 'type', 'fuel_type', 'mileage', 'passenger_cap', 'description', 'created_at', 'updated_at'];
}
