<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAssetsCategoriesTable extends Migration
{
    public function up()
    {
        Schema::create('assets_categories', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 50)->nullable()->unique();
            $table->string('type', 200)->nullable();
            $table->string('description', 255)->nullable();
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('deleted_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });
        DB::table('assets_categories')->insert([
            array('name' => 'Unknown', 'type' => 'unknown', 'description' => 'unknown devices category'),
            array('name' => 'Buses', 'type' => 'vehicles', 'description' => ''),
            array('name' => 'Microbuses', 'type' => 'vehicles', 'description' => ''),
            array('name' => 'Pupils', 'type' => 'humans', 'description' => ''),
            array('name' => 'Students', 'type' => 'humans', 'description' => ''),
            array('name' => 'Employees', 'type' => 'humans', 'description' => ''),
            array('name' => 'Monitors', 'type' => 'humans', 'description' => ''),
            array('name' => 'Drivers', 'type' => 'humans', 'description' => ''),
            array('name' => 'Human Cellular Phone', 'type' => 'humans_devices', 'description' => ''),
            array('name' => 'Human RFID Tag', 'type' => 'humans_devices', 'description' => ''),
            array('name' => 'Vehicle AVL', 'type' => 'vehicles_devices', 'description' => ''),
            array('name' => 'Vehicle RFID Getaway', 'type' => 'vehicles_devices', 'description' => ''),
            array('name' => 'Vehicle DVR', 'type' => 'vehicles_devices', 'description' => ''),
            array('name' => 'Sensor', 'type' => 'iot_things_devices', 'description' => '')
        ]);

        if (Schema::hasTable('assets_persons')) {
            Schema::table('assets_persons', function (Blueprint $table) {
                $table->foreign('assets_category_id')->references('id')->on('assets_categories')->onUpdate('cascade');
            });
        }
        if (Schema::hasTable('assets_resources')) {
            Schema::table('assets_resources', function (Blueprint $table) {
                $table->foreign('assets_category_id')->references('id')->on('assets_categories')->onUpdate('cascade');
            });
        }
        if (Schema::hasTable('assets_vehicles')) {
            Schema::table('assets_vehicles', function (Blueprint $table) {
                $table->foreign('assets_category_id')->references('id')->on('assets_categories')->onUpdate('cascade');
            });
        }

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_assetscategory', 'display_name' => 'view_assetscategory'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'add_assetscategory', 'display_name' => 'add_assetscategory'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'edit_assetscategory', 'display_name' => 'edit_assetscategory'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'delete_assetscategory', 'display_name' => 'delete_assetscategory'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
    }

    public function down()
    {
        //
    }
}
