<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTasksRoutesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tasks_routes', function (Blueprint $table) {
            $table->increments('id');
            $table->string('title', 50)->nullable();
            $table->string('description', 1024)->nullable();
            $table->date('start_date', 50)->nullable();
            $table->date('end_date', 50)->nullable();
            $table->timestamp('start_time', 50)->nullable();
            $table->timestamp('end_time', 50)->nullable();
            $table->string('map_distance')->nullable();
            $table->string('estimated_time')->nullable();
            $table->boolean('status')->nullable();
            $table->integer('opened_by')->nullable()->unsigned();
            $table->foreign('opened_by')->references('id')->on('users')->onUpdate('cascade');
            $table->integer('vehicle_id')->nullable()->unsigned();
            $table->integer('driver_id')->nullable()->unsigned();
            $table->integer('category_id')->nullable()->unsigned();
            $table->foreign('category_id')->references('id')->on('categories')->onUpdate('cascade');
            $table->timestamps();
        });

        /*
         *  TASK POINTS FOREIGN KEYS  - AS TASK RELATIONS
         */
        if (Schema::hasTable('task_points')) {
            Schema::table('task_points', function (Blueprint $table) {
                $table->foreign('points_of_interests_id')->references('id')->on('points_of_interests')->onUpdate('cascade');
                $table->foreign('assets_person_id')->references('id')->on('assets_persons')->onUpdate('cascade');
            });
        }

        if (Schema::hasTable('task_groups')) {
            Schema::table('task_groups', function (Blueprint $table) {
                $table->foreign('task_points_id')->references('id')->on('task_points')->onUpdate('cascade');
                $table->foreign('task_id')->references('id')->on('tasks')->onUpdate('cascade');
            });
        }
        if (Schema::hasTable('tasks_routes')) {
            Schema::table('tasks_routes', function (Blueprint $table) {
                $table->foreign('vehicle_id')->references('id')->on('assets_vehicles')->onUpdate('cascade');
                $table->foreign('driver_id')->references('id')->on('assets_persons')->onUpdate('cascade');
            });
        }
    }
    public function down()
    {
        Schema::drop('tasks_routes');
    }
}
