<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class TaskPoints extends Model
{
    protected $table = 'task_points';
    protected $fillable = ['name', 'points_of_interests_id', 'assets_person_id', 'created_at', 'updated_at'];
}
