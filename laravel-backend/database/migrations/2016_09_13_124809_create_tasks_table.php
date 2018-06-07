<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTasksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->increments('id');
            $table->string('title', 50)->nullable();
            $table->string('description', 1024)->nullable();
            $table->date('start_date', 50)->nullable();
            $table->date('end_date', 50)->nullable();
            $table->boolean('task_status')->nullable();
            $table->integer('user_id')->nullable()->unsigned();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->integer('category_id')->nullable()->unsigned();
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            $table->timestamps();
        });
        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'view_task', 'display_name' => 'view_task')
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 1)
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 2)
        );

        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'add_task', 'display_name' => 'add_task')
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 1)
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 2)
        );

        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'delete_task', 'display_name' => 'delete_task')
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 1)
        );
        DB::table('permission_role')->insert(
            array('permission_id' => $perm_id, 'role_id' => 2)
        );

        $perm_id = DB::table('permissions')->insertGetId(
            array('name' => 'edit_task', 'display_name' => 'edit_task')
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
        Schema::drop('tasks');
    }
}
