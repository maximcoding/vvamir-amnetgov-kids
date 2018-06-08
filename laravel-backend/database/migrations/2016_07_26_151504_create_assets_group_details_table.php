<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAssetsGroupDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('assets_groups_details', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('assets_person_id')->nullable()->unsigned();
            $table->integer('assets_vehicle_id')->nullable()->unsigned();
            $table->integer('assets_group_id')->nullable()->unsigned();
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('deleted_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->index('assets_group_id');
            $table->unique(array('assets_group_id','assets_person_id'));
            $table->unique(array('assets_group_id','assets_vehicle_id'));
        });

        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'view_assets_group_details', 'display_name' => 'view_assets_group_details')
        );
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
            array('name' => 'add_assets_group_details', 'display_name' => 'add_assets_group_details')
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 1)
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 2)
        );
        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'edit_assets_group_details', 'display_name' => 'edit_assets_group_details')
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 1)
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 2)
        );
        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'delete_assets_group_details', 'display_name' => 'delete_assets_group_details')
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
        Schema::drop('assets_groups_details');
    }
}
