<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class UsersWatchGroups extends Model
{
    protected $table = 'users_watch_groups';
    protected $fillable = ['user_id', 'assets_group_id', 'created_at', 'updated_at'];
}
