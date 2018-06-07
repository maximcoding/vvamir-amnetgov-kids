<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAvlTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('avls', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('avl_time')->nullable();
            $table->bigInteger('resource_id')->nullable()->unsigned();
            $table->string('serial', 50)->nullable();
            $table->string('imei', 50)->nullable();
            $table->string('distance', 50)->nullable();
            $table->string('resources')->nullable();
            $table->double('lat')->nullable();
            $table->double('lng')->nullable();
            $table->double('speed')->nullable();
            $table->integer('heading')->nullable();
            $table->integer('gsmsignal')->nullable();
            $table->integer('io')->nullable();
            $table->double('temperature')->nullable();
            $table->integer('rfid_num')->nullable();
            $table->string('rfid_tags')->nullable();
            $table->double('battvolt')->nullable();
            $table->double('extvolt')->nullable();
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('deleted_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });


        /*
         *  add avltracking permission to 'administrator' role. 'administrator' role id is 1.
         */
        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_avl', 'display_name' => 'view_avl'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 3));
        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'add_avl', 'display_name' => 'add_avl'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'edit_avl', 'display_name' => 'edit_avl'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'delete_avl', 'display_name' => 'delete_avl'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_avls_for_managers', 'display_name' => 'view_avls_for_managers'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_avls_for_users', 'display_name' => 'view_avls_for_users'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 3));
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('avls');

    }
}
