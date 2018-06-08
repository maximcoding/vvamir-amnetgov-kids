<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    protected $table = 'chat_messages';

    protected $fillable = ['command', 'conversation_id', 'message', 'sender_id', 'recipient', 'topic', 'deleted_at'];

}
