<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Avl extends Model
{

    protected $table = 'avls';


    protected $fillable = ['avl_time', 'resource_id', 'resources', 'lat', 'lng', 'speed', 'heading', 'gsmsignal', 'io', 'temperature', 'rfid_num', 'rfid_tags',
        'battvolt', 'extvolt', 'created_at', 'updated_at'];

}
