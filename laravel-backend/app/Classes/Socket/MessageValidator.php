<?php
/**
 * Created by IntelliJ IDEA.
 * User: fafa
 * Date: 9/27/2016
 * Time: 5:12 PM
 */

namespace App\Classes\Socket;

use Carbon\Carbon;
use App\Http\Controllers\Controller;
use Log;
use Illuminate\Support\Facades\DB;


class MessageValidator extends Controller
{
    protected $COMMANDS;

    public function __construct()
    {
        //   require_once(app_path() . '\Commands\commands.php');
        $this->COMMANDS = $this->getCommands();
    }

    public function getCommands()
    {
        return [
            'USER_WS_DISCONNECTED' => 0,
            'USER_WS_CONNECTED' => 1,
            'USER_WS_ONLINE' => 2,
            'USER_WS_MESSAGE' => 3,
            'MQTT_SUBSCRIBE' => 10,
            'MQTT_AVL_REPORT' => 11,
            'USER_WS_HEARTBEAT' => 77,
            'USER_CHAT_CONVERSATION_CREATED' => 88,
            'USER_CHAT_CONVERSATION_LEFT' => 99,
        ];
    }


    public function validateWebSocketMessage($message)
    {
        if (is_object(json_decode($message))) {
            $message = json_decode($message);
            $statement = (integer)$message->command;
            Log::info('$statement .. ' . json_encode($statement));
            switch ($statement) {
                case $this->COMMANDS['MQTT_AVL_REPORT']:  // 11
                case $this->COMMANDS['MQTT_SUBSCRIBE']: // 10
                    return true;

                case $this->COMMANDS['USER_WS_CONNECTED']: // 1
                case $this->COMMANDS['USER_WS_MESSAGE']: // 3
                case $this->COMMANDS['USER_WS_DISCONNECTED']: // 0
                case $this->COMMANDS['USER_WS_ONLINE']: // 2
                case $this->COMMANDS['USER_WS_HEARTBEAT']: // 77
                    //  $users = DB::table('users')->where('remember_token', $message->token)->select('remember_token', 'last_token_time')->get();
                    $users = DB::select('select remember_token,last_token_time FROM users where remember_token=? and id =?', [$message->token, $message->sender_id]);
                    Log::info('$users .. ' . json_encode($users));
//                    if (count($users) >= 0) {
//                        $date1 = date_create($users[0]->last_token_time);
//                        $now = Carbon::now()->toDateTimeString();
//                        $date2 = date_create($now);
//                        $diff = date_diff($date1, $date2);
//                        if (strcmp($users[0]->remember_token, $message->token) == 0 && (intval($diff->format("%i")) <= 60)) {
//                            $returned = true;
//                        }
//                    }
                    return true;
                default:
                    return false;
                    break;
            }
        }
    }


}