<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateGalleriesTable extends Migration
{
    public function up()
    {
        Schema::create('galleries', function (Blueprint $table) {
            $table->increments('id');
            $table->string('filename', 100)->nullable();
            $table->integer('size')->nullable();
            $table->integer('task_id')->nullable()->unsigned();
            $table->foreign('task_id')->references('id')->on('tasks')->onUpdate('cascade');
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('deleted_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'add_gallery', 'display_name' => 'add_gallery'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'edit_gallery', 'display_name' => 'edit_gallery'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_gallery', 'display_name' => 'view_gallery'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'delete_gallery', 'display_name' => 'delete_gallery'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
    }

    public function down()
    {
        Schema::drop('galleries');
    }
}
