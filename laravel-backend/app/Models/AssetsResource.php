<?php

namespace App\Models;

use Sofa\Eloquence\Eloquence;
use Illuminate\Database\Eloquent\Model;

class AssetsResource extends Model
{
    use Eloquence;

    protected $table = 'assets_resources';

    protected $searchableColumns = ['imei', 'serial'];

    public function organizations()
    {
        return $this->belongsTo(Organization::class); // also Profile belongsTo Address
    }

    protected $fillable = ['status', 'imei', 'serial', 'sim', 'phone', 'ip_address', 'device_type', 'organization_id', 'description', 'assets_category_id', 'created_at', 'updated_at'];
}
