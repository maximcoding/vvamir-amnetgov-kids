<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTaskMismatchTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('task_mismatch', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('task_id')->nullable()->unsigned();
            $table->bigInteger('resource_id')->nullable()->unsigned();
            $table->string('reason',100)->nullable();
            $table->bigInteger('point_of_int_id')->nullable()->unsigned();
            $table->double('latitude')->nullable();
            $table->double('longtitude')->nullable();
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('task_mismatch');
    }
}
