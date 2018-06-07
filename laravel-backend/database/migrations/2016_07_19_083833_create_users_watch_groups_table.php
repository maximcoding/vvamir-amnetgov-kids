<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersWatchGroupsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {

        Schema::create('users_watch_groups', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id')->nullable()->unsigned();
            $table->integer('assets_group_id')->nullable()->unsigned();
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            //    $table->foreign('user_id')->references('id')->on('users')->onUpdate('cascade');
            $table->index('user_id');
            $table->unique(array('assets_group_id', 'user_id'));
            $table->timestamp('deleted_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });
        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'view_watchergroup', 'display_name' => 'view_watchergroup'));
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 1)
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 2)
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 3)
        );
        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'add_watchergroup', 'display_name' => 'add_watchergroup')
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 1)
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' =>2)
        );
        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'edit_watchergroup', 'display_name' => 'edit_watchergroup')
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 1)
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 2)
        );
        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'delete_watchergroup', 'display_name' => 'delete_watchergroup')
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 1)
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 2)
        );
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('users_watch_groups');

    }
}
