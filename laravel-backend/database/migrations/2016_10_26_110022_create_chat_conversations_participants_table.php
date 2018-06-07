<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateChatConversationsParticipantsTable extends Migration
{
    public function up()
    {
        Schema::create('chat_conversations_participants', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('conversation_id')->nullable()->unsigned();
            $table->integer('participant_id')->nullable()->unsigned();
            $table->foreign('participant_id')->references('id')->on('users');
            $table->index('conversation_id');
            $table->unique(array('conversation_id', 'participant_id'));
        });

        //create public chat room for it
        $data = array('about' => 2, 'topic' => 2, 'created_by' => 1);
        $amnetion_public_room_id = DB::table('chat_conversations')->insertGetId($data);
        /*
        * create default participants in chat
        */
        //admin
        $data = array('participant_id' => 1, 'conversation_id' => $amnetion_public_room_id);
        $org_id = DB::table('chat_conversations_participants')->insertGetId($data);
        //manager
        $data = array('participant_id' => 2, 'conversation_id' => $amnetion_public_room_id);
        $org_id = DB::table('chat_conversations_participants')->insertGetId($data);
        //user
        $data = array('participant_id' => 3, 'conversation_id' => $amnetion_public_room_id);
        $org_id = DB::table('chat_conversations_participants')->insertGetId($data);

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
