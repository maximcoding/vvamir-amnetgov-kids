<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAssetsPersonsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('assets_persons', function (Blueprint $table) {
            $table->increments('id');
            $table->string('firstname')->nullable();
            $table->string('lastname')->nullable();
            $table->string('avatar_url', 200)->nullable();
            $table->string('city', 250)->nullable();
            $table->string('street', 250)->nullable();
            $table->string("phone")->nullable();
            $table->string('biography', 255)->nullable();
            $table->integer('assets_category_id')->nullable()->unsigned();
            $table->integer('organization_id')->nullable()->unsigned();
            $table->bigInteger('default_point_of_interest')->nullable()->unsigned();
            $table->string('website', 255)->nullable();
            $table->string('birthdate', 50)->nullable();
            $table->tinyInteger('gender')->nullable();
            $table->string('blood_type', 3)->nullable();
            $table->string('description')->nullable();
            $table->string('card_id', 50)->nullable();
            $table->integer('status')->default(0);
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('deleted_at')->default(DB::raw('CURRENT_TIMESTAMP'));

        });

        /*
         *  add assetsperson permission to 'administrator' role. 'administrator' role id is 1.
        */
        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_assetsperson', 'display_name' => 'view_assetsperson'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'add_assetsperson', 'display_name' => 'add_assetsperson'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'edit_assetsperson', 'display_name' => 'edit_assetsperson'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'delete_assetsperson', 'display_name' => 'delete_assetsperson'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_assetsperson_for_managers', 'display_name' => 'view_assetsperson_for_managers'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'add_assetsperson_for_managers', 'display_name' => 'add_assetsperson_for_managers'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'edit_assetsperson_for_managers', 'display_name' => 'edit_assetsperson_for_managers'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'delete_assetsperson_for_managers', 'display_name' => 'delete_assetsperson_for_managers'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));


        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_assetsperson_for_users', 'display_name' => 'view_assetsperson_for_users'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 3));
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('assets_persons');
    }
}
