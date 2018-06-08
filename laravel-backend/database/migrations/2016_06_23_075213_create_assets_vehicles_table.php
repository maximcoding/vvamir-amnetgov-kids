<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAssetsVehiclesTable extends Migration
{
    public function up()
    {
        Schema::create('assets_vehicles', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('organization_id')->nullable()->unsigned();
            $table->integer('assets_category_id')->nullable()->unsigned();
            $table->bigInteger('night_parking_lot')->nullable()->unsigned();
            $table->string('plate', 10)->nullable();
            $table->string('model', 30)->nullable();
            $table->string('type', 30)->nullable();
            $table->string('fuel_type', 30)->nullable();
            $table->string('mileage', 30)->nullable();
            $table->integer('passenger_cap')->nullable();
            $table->string('description')->nullable();
            $table->integer('status')->default(0);
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('deleted_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });

        /*
         *  add assetsvehicle permission  to 'administrator' role. 'administrator' role id is 1.
         */
        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_assetsvehicle', 'display_name' => 'view_assetsperson'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'add_assetsvehicle', 'display_name' => 'add_assetsvehicle'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'edit_assetsvehicle', 'display_name' => 'edit_assetsvehicle'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'delete_assetsvehicle', 'display_name' => 'delete_assetsvehicle'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));

        /*
               *  add assetsvehicle permission  to 'managers' role. 'administrator' role id is 2.
               */
        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_assetsvehicle_for_managers', 'display_name' => 'view_assetsvehicle_for_managers'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'add_assetsvehicle_for_managers', 'display_name' => 'add_assetsvehicle_for_managers'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'edit_assetsvehicle_for_managers', 'display_name' => 'edit_assetsvehicle_for_managers'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'delete_assetsvehicle_for_managers', 'display_name' => 'delete_assetsvehicle_for_managers'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));

//USERS ONLY VIEW
        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_assetsvehicle_for_users', 'display_name' => 'view_assetsvehicle_for_users'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 3));
    }

    public function down()
    {
        Schema::drop('assets_vehicles');
    }
}
