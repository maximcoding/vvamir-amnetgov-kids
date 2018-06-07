<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAssetsResourcesTable extends Migration
{
    public function up()
    {
        Schema::create('assets_resources', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('imei', 30)->nullable()->unique();
            $table->string('serial', 30)->nullable()->unique();
            $table->integer('assets_category_id')->nullable()->unsigned();
            $table->integer('organization_id')->nullable()->unsigned();
            $table->string('sim', 20)->nullable()->unique();
            $table->string('phone', 20)->nullable()->unique();
            $table->string('ip_address')->nullable();
            //      $table->ipAddress('ip_address')->nullable();
            $table->integer('status')->default(0);
            $table->string('description')->nullable();
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('deleted_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->index('organization_id');
        });

        /*
         *  add assetsresource permission  to 'administrator' role. 'administrator' role id is 1.
         */
        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_assetsresource', 'display_name' => 'view_assetsresource'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'add_assetsresource', 'display_name' => 'add_assetsresource'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'edit_assetsresource', 'display_name' => 'edit_assetsresource'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'delete_assetsresource', 'display_name' => 'delete_assetsresource'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));




    }

    public function down()
    {
        Schema::drop('assets_resources');
    }
}
