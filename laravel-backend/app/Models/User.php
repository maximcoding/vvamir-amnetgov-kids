<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Nicolaslopezj\Searchable\SearchableTrait;
use PhpSoft\Users\Models\UserTrait;

class User extends Model implements AuthenticatableContract,
    //AuthorizableContract,
    CanResetPasswordContract
{

    protected $primaryKey = 'id';

    protected $table = 'users';

    use SearchableTrait;
    protected $searchable = [
        'columns' => [
            'users.firstname' => 10,
            'users.lastname' => 10,
            'users.email' => 15,
            'users.city' => 7,
            'users.street' => 8,
            'users.phone' => 9
        ]
    ];

//    public function organizations()
//    {
//        return $this->hasOne('App\Models\Organization');
//    }

    public function Role()
    {
        return $this->hasOne('App\Models\Role');
    }

    use Authenticatable, CanResetPassword, UserTrait;


    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'firstname',
        'lastname',
        'email',
        'password',
        'avatar_url',
        'organization_id',
        'username',
        'city',
        'street',
        'phone',
        'biography',
        'occupation',
        'image',
        'website',
        'birthday',
        'gender',
        'blood_type',
        'status',
        'birthday',
        'last_message_time',
        'timezone',
        'country',
        'remember_token'
    ];


    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = ['password', 'remember_token'];


    #### import fields
    public $import_fields = ['country','city', 'street', 'phone', 'website', 'image', 'birthday', 'username', 'blood_type', 'email', 'password', 'firstname', 'lastname', 'gender', 'status'];
}
