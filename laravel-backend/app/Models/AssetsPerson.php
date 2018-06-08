<?php

namespace App\Models;

use Nicolaslopezj\Searchable\SearchableTrait;
use Illuminate\Database\Eloquent\Model;


class AssetsPerson extends Model
{

    protected $table = 'assets_persons';

    //   protected $fillable = array("*");
    protected $fillable = [
        'id',
        'firstname',
        'lastname',
        'avatar_url',
        'city',
        'street',
        'phone',
        'biography',
        'assets_category_id',
        'organization_id',
        'default_point_of_interest',
        'website',
        'birthdate',
        'gender',
        'blood_type',
        'description',
        'card_id',
        'status',
        'created_at',
        'updated_at'];

}
