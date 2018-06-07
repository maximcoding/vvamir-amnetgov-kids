<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOrganizationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->increments('id');
            $table->string('name', 250)->nullable()->unique('name');
            $table->string('type', 100)->nullable();
            $table->string('description', 1000)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('city', 250)->nullable();
            $table->string('street', 250)->nullable();
            $table->double('lat')->nullable();
            $table->double('lng')->nullable();
            $table->string('phone', 100)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('website', 255)->nullable();
            $table->string('image', 255)->nullable();
            $table->string('avatar_url', 100)->nullable();
            $table->integer('status')->default(0);
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('deleted_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });


        /*
        * create default organization for administrators
        */
        DB::table('organizations')->insert([
            array('name' => 'unknown','avatar_url' => 'unknown.png', 'type' => 'unknown', 'description' => 'unknown organization', 'created_at' => date("Y-m-d H:i:s")),
            array('name' => 'amnetiot', 'avatar_url' => 'amnetiot.png', 'type' => 'owner', 'description' => 'owner company', 'created_at' => date("Y-m-d H:i:s"))
        ]);

        /*
         *  add organization permission to administrator
         */
        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'view_organization', 'display_name' => 'view_organization')
        );
        // add 'view_organization' permission to 'administrator' role. 'administrator' role id is 1.
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 1)
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 2)
        );

        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'add_organization', 'display_name' => 'add_organization')
        );
        // add 'add_organization' permission to 'administrator' role.'administrator' role id is 1.
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 1)
        );

        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'edit_organization', 'display_name' => 'edit_organization')
        );
        // add 'edit_organization' permission to 'administrator' role.'administrator' role id is 1.
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 1)
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 2)
        );

        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'delete_organization', 'display_name' => 'delete_organization')
        );
        // add 'delete_organization' permission to 'administrator' role. 'administrator' role id is 1.
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 1)
        );


        /*
    *  add organization permission to managers
    */
        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'view_organization_for_managers', 'display_name' => 'view_organization_for_managers')
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 2)
        );
        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'edit_organization_for_managers', 'display_name' => 'edit_organization_for_managers')
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
        Schema::drop('organizations');
    }
}
