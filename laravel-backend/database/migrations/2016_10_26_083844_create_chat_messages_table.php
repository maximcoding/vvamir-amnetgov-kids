<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateChatMessagesTable extends Migration
{
    public function up()
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('message', 1024)->nullable();
            $table->integer('command')->nullable()->unsigned();
            $table->integer('topic')->nullable()->unsigned();
            $table->integer('sender_id')->nullable()->unsigned();
            $table->integer('conversation_id')->nullable()->unsigned();
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
