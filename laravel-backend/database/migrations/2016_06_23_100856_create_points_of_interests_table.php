<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePointsOfInterestsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('points_of_interests', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('organization_id')->nullable()->unsigned();
            $table->string('name')->nullable();
            $table->double('lat')->nullable();
            $table->double('lng')->nullable();
            $table->string('address')->nullable();
            $table->string("city")->nullable();
            $table->string("street")->nullable();
            $table->integer("building")->nullable();
            $table->string('description')->nullable();
            $table->string('marker_color')->nullable();
            $table->string('marker_icon')->nullable();
            $table->integer('status')->default(0);
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('deleted_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });
        /*
*  add pointofint permission
*/
        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'view_point', 'display_name' => 'view_point')
        );
        // add 'view_pointofint' permission to 'administrator' role. 'administrator' role id is 1.
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 3));

        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'add_point', 'display_name' => 'add_point')
        );
        // add 'add_pointofint' permission to 'administrator' role.'administrator' role id is 1.
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));

        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'edit_point', 'display_name' => 'edit_point')
        );
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'delete_point', 'display_name' => 'delete_point')
        );
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('points_of_interests');
    }
}
