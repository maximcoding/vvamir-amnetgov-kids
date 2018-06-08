<?php

namespace App\Models;

use Nicolaslopezj\Searchable\SearchableTrait;
use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{

    use SearchableTrait;
    protected $searchable = [
        'columns' => [
            'organizations.name' => 50,
            'organizations.type' => 30,
            'organizations.phone' => 12
        ]

    ];
    protected $table = 'organizations';

    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $fillable = ['name', 'lat', 'lng', 'type', 'city', 'street', 'phone', 'email', 'website', 'image', 'avatar_url', 'description', 'status', 'created_at', 'updated_at'];

}
