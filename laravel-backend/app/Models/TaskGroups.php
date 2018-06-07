<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;


class TaskGroups extends Model
{

    protected $table = 'task_groups';

    protected $fillable = ['task_id', 'task_points_id', 'task_points_id', 'created_at', 'updated_at'];


}
