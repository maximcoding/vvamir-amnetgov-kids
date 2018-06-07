<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use League\Flysystem\Exception;
use Maatwebsite\Excel\Facades\Excel;
use Validator;
use Log;

class ChatConversationsController extends Controller
{

    public function __construct()
    {
        // Apply the jwt.auth middleware to all methods in this controller
        // except for the authenticate method. We don't want to prevent
        // the user from retrieving their token if they don't already have it
        $this->middleware('jwt.auth', ['except' => ['authenticate']]);
    }

    public function index()
    {

        $now = Carbon::now();
        $from = Carbon::createFromFormat('Y-m-d H:i:s', $now, 'UTC')->subDays(8);
        $to = $now->toDateTimeString();
        $user_conversations = ChatConversation
            ::leftJoin('chat_conversations_participants', 'chat_conversations.id', '=', 'chat_conversations_participants.conversation_id')
            ->where('chat_conversations.topic', '=', Auth::user()->organization_id)
            ->where('chat_conversations_participants.participant_id', '=', Auth::user()->id)
            ->select('chat_conversations.id as conversation_id', 'chat_conversations.about', 'chat_conversations.created_at')
            ->get();

        foreach ($user_conversations as $coversation) {
            $matched_for_msgs = array('topic' => Auth::user()->organization_id, 'command' => 3, 'conversation_id' => $coversation->conversation_id);
            $conversation_participants = DB::table("chat_conversations_participants")
                ->where('conversation_id', '=', $coversation->conversation_id)
                ->get();
            $coversation->conversation_participants = $conversation_participants;
            $coversation->conversation_messages =
                ChatMessage
                    ::leftJoin('users', 'users.id', '=', 'chat_messages.sender_id')
                    ->where($matched_for_msgs)
                    ->whereBetween('chat_messages.created_at', array($from, $to))
                    ->select('chat_messages.*', 'users.firstname', 'users.lastname')
                    ->get();
        }
        return $user_conversations;

    }


    public function store(Request $request)
    {

        $match_this = array('about' => $request->about, 'topic' => $request->topic, 'created_by' => Auth::user()->id);

        $conversation_id = ChatConversation::insertGetId($match_this);
        $just_created = ChatConversation::where('id', $conversation_id)->select('about', 'topic', 'id as conversation_id', 'created_by', 'created_at')->first();
        foreach ($request->conversation_participants as $participant_id) {
            DB::insert('insert into chat_conversations_participants (participant_id,conversation_id) values (?,?)',
                array($participant_id, $conversation_id));
        }
        $matchThese = array('conversation_id' => $conversation_id);
        $conversation_participants = DB::table("chat_conversations_participants")->where($matchThese)->select('conversation_id', 'participant_id')->get();
        $just_created->conversation_participants = $conversation_participants;
        return $just_created;

    }


    public function destroy($id)
    {
        $matchThese = array('id' => $id);
        //check if it not a public room
        $conversation = DB::table('chat_conversations')->where($matchThese)->first();
        if ($conversation->about !== Auth::user()->organization_id) {
            $matchThese = array('conversation_id' => $id);
            $count = DB::table("chat_conversations_participants")->where($matchThese)->count();
            $deleted = DB::table("chat_conversations_participants")->where($matchThese)->delete();
            // if he was last in conversation delete conversation also after him
            if ($count <= 1) {
                $matchThese = array('id' => $id);
                $deleted = DB::table("chat_conversations")->where($matchThese)->delete();
            }
        } else {
            return response()->json(['error' => 'You not have permission to remove yourself from public room'], 403);
        }

    }

}
