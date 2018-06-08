<?php

namespace App\Models;

use Nicolaslopezj\Searchable\SearchableTrait;
use Illuminate\Database\Eloquent\Model;

class AssetsCategory extends Model
{
    protected $table = 'assets_categories';

    protected $fillable = ['name','description','created_at','updated_at'];
}
