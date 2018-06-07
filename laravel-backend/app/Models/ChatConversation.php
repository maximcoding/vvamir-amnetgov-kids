<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatConversation extends Model
{
    protected $table = 'chat_conversations';
    protected $fillable = ['about', 'topic', 'created_by', 'created_at'];


}
