<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSuborganizationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('suborganizations', function (Blueprint $table) {
            $table->integer('organization_id')->nullable()->unsigned();
            $table->integer('id')->nullable()->unsigned();
            $table->string('name', 150)->nullable();
            $table->string('type', 150)->nullable();
            $table->foreign('organization_id')->references('id')->on('organizations')->onUpdate('cascade');
            $table->index('organization_id');
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('deleted_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });

        /*
         *  add organization permission  to 'administrator' role.'administrator' role id is 1.
         */
        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_suborganizations', 'display_name' => 'view_suborganizations'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'add_suborganizations', 'display_name' => 'add_suborganizations'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'edit_suborganizations', 'display_name' => 'edit_suborganizations'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'delete_suborganizations', 'display_name' => 'delete_suborganizations'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('suborganizations');
    }
}
