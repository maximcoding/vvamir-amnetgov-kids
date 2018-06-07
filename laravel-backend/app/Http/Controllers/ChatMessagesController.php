<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use Hamcrest\Core\IsNot;
use Log;
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


class ChatMessagesController extends Controller
{

    public function __construct()
    {

        // Apply the jwt.auth middleware to all methods in this controller
        // except for the authenticate method. We don't want to prevent
        // the user from retrieving their token if they don't already have it
        $this->middleware('jwt.auth', ['except' => ['authenticate']]);

    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $now = Carbon::now();
        $to = $now->toDateTimeString();
        $query = "SELECT chat_messages.*,users.firstname,users.lastname 
                      FROM chat_messages
                      LEFT JOIN users
                      ON users.id = chat_messages.sender_id
                      WHERE chat_messages.conversation_id IN (
                      SELECT conversation_id FROM chat_conversations_participants WHERE participant_id = ?)
                      AND chat_messages.created_at BETWEEN ? AND ? ";

        if ($request->from_time) {
            $from = Auth::user()->last_message_time;
            $from = Carbon::createFromFormat('Y-m-d H:i:s', $from, 'UTC')->addSecond();
            $from = $from->toDateTimeString();
            return DB::select($query, [Auth::user()->id, $from, $to]);
        } else {
            $from = Carbon::createFromFormat('Y-m-d H:i:s', $now, 'UTC')->subDays(8);
            $from = $from->toDateTimeString();
            return DB::select($query, [Auth::user()->id, $from, $to]);
        }
    }


    public function store(Request $request)
    {
//        $message = ChatMessage::create($request->all());
        DB::table('chat_messages')->insert([
            [
                'message' => $request->message,
                'conversation_id' => $request->conversation_id,
                'command' => $request->command,
                'sender_id' => $request->sender_id,
                'topic' => $request->topic
            ]
        ]);
    }


    public function check(Request $request)
    {
        return $request;
    }


    public function show($id)
    {
    }


}
