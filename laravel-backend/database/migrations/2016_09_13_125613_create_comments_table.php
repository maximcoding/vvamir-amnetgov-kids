<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCommentsTable extends Migration
{
    public function up()
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->increments('id');
            $table->string('comment_text', 250)->nullable();
            $table->integer('user_id')->nullable()->unsigned();
            $table->foreign('user_id')->references('id')->on('users')->onUpdate('cascade');
            $table->integer('task_id')->nullable()->unsigned();
            $table->foreign('task_id')->references('id')->on('tasks')->onUpdate('cascade');
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('deleted_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });

        /*
         *  add comment permission 'administrator' role. 'administrator' role id is 1.
         */
        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_comment', 'display_name' => 'view_comment'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'add_comment', 'display_name' => 'add_comment'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'edit_comment', 'display_name' => 'edit_comment'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));

        $perm_id = DB::table('permissions')->insertGetId(array('name' => 'delete_comment', 'display_name' => 'delete_comment'));
        DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
    }

    public function down()
    {
        Schema::drop('comments');
    }
}
