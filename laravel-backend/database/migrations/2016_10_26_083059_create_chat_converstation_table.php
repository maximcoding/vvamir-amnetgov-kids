<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateChatConverstationTable extends Migration
{
    public function up()
    {
        Schema::create('chat_conversations', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('about', 500)->nullable();
            $table->integer('created_by')->nullable()->unsigned();
            $table->foreign('created_by')->references('id')->on('users');
            $table->integer('topic')->nullable()->unsigned();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('deleted_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
