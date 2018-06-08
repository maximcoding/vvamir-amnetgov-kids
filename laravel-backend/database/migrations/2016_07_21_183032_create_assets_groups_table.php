<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAssetsGroupsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('assets_groups', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 250)->nullable();
            $table->string('description', 250)->nullable();
            $table->integer('organization_id')->nullable()->unsigned();
            $table->integer('created_by')->nullable()->unsigned();
            $table->foreign('created_by')->references('id')->on('users')->onUpdate('cascade');
            $table->integer('status')->default(0);
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('deleted_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->unique(array('organization_id', 'name'));
            $table->index('id');
        });

        if (Schema::hasTable('users_watch_groups')) {
            Schema::table('users_watch_groups', function (Blueprint $table) {
                $table->foreign('assets_group_id')->references('id')->on('assets_groups')->onUpdate('cascade');
            });
        }


        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_assetsgroup', 'display_name' => 'view_assetsgroup'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 3));
        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'add_assetsgroup', 'display_name' => 'add_assetsgroup'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'edit_assetsgroup', 'display_name' => 'edit_assetsgroup'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'delete_assetsgroup', 'display_name' => 'delete_assetsgroup'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));


        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_assetsgroup_for_managers', 'display_name' => 'view_assetsgroup_for_managers'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'add_assetsgroup_for_managers', 'display_name' => 'add_assetsgroup_for_managers'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'edit_assetsgroup_for_managers', 'display_name' => 'edit_assetsgroup_for_managers'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'delete_assetsgroup_for_managers', 'display_name' => 'delete_assetsgroup_for_managers'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));


        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_assetsgroup_for_users', 'display_name' => 'view_assetsgroup_for_users'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 3));
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('assets_groups');

    }
}
