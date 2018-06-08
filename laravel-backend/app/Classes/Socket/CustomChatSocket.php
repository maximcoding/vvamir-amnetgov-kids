<?php

/**
 * Created by IntelliJ IDEA.
 * User: fafa
 * Date: 9/19/2016
 * Time: 1:44 PM
 */

namespace App\Classes\Socket;


use App\Classes\Socket\Base\BaseSocket;
use League\Flysystem\Exception;
use Ratchet\ConnectionInterface;
use App\Classes\CustomWsConnection;
use Log;
use Carbon\Carbon;
use App\User;
use Illuminate\Support\Facades\DB;


class CustomChatSocket extends BaseSocket
{
    protected $clientsInTopic;
    protected $clients;
    protected $connections;
    protected $newConnection;
    protected $COMMANDS;


    private function getCommands()
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

    public function __construct()
    {
        $this->COMMANDS = $this->getCommands();
        $this->connections = new \SplObjectStorage;
        $this->clients = new \SplObjectStorage;
    }

    private function validateWebSocketMessage($message)
    {
        $returned = false;
        Log::info('websocket validation event .. ' . json_encode($message));
        if (is_object(json_decode($message))) {
            $message = json_decode($message);
            switch ($message->command) {
                case $this->COMMANDS['MQTT_AVL_REPORT']:  // 11
                case $this->COMMANDS['MQTT_SUBSCRIBE']: // 10
                    $returned = true;
                    break;
                case $this->COMMANDS['USER_WS_DISCONNECTED']: // 0
                case $this->COMMANDS['USER_WS_CONNECTED']: // 1
                case $this->COMMANDS['USER_WS_ONLINE']: // 2
                case $this->COMMANDS['USER_WS_MESSAGE']: // 3
                case $this->COMMANDS['USER_WS_HEARTBEAT']: // 77
                case $this->COMMANDS['USER_CHAT_CONVERSATION_CREATED']: // 88
                case $this->COMMANDS['USER_CHAT_CONVERSATION_LEFT']: // 99
                    $users = DB::select('select remember_token,last_token_time FROM users where remember_token=? and id =?', [$message->token, $message->sender_id]);
                    if (count($users) >= 0) {
                        $date1 = date_create($users[0]->last_token_time);
                        $now = Carbon::now()->toDateTimeString();
                        $date2 = date_create($now);
                        $diff = date_diff($date1, $date2);
                        if (strcmp($users[0]->remember_token, $message->token) == 0 && (intval($diff->format("%i")) <= 60)) {
                            $returned = true;
                        }
                    }
                    break;
                default:
                    $returned = false;
                    break;
            }
        }
        return $returned;
    }


    public function onOpen(ConnectionInterface $conn)
    {
        try {
            $this->newConnection = $conn;
            echo $this->newConnection->resourceId . " connected !" . "\n";
            // clear websocket connection list
            $this->connections->attach($conn);
            $customWsConnection = new CustomWsConnection($conn->resourceId);
            // clients as connections
            $this->clients->attach($customWsConnection);
            echo "connections number now :" . $this->clients->count() . "\n";
        } catch (Exception $x) {
            Log::error(json_encode($x));
        }
    }

    public function onMessage(ConnectionInterface $from, $msg)
    {
        try {
            Log::debug('normal onMessage server event : ' . $msg);
            if ($this->validateWebSocketMessage($msg)) {
                $message = json_decode($msg);
                $message->token = '';
                if (property_exists($message, 'command')) {
                    if (!$message->sent) {
                        $message->sent = 1; // mark message as sent
                        switch ($message->command) {
                            case $this->COMMANDS['USER_WS_HEARTBEAT']: //77
                                echo "{$from->resourceId} checking {$message->command} : " . $message->message . "\n";
                                return;
                            case $this->COMMANDS['USER_WS_CONNECTED']: //1
                                $message->sent = 1;
                                // create new list of connections for topic where created new connection
                                $this->clientsInTopic = [];
                                $this->clients->rewind();
                                $this->connections->rewind();
                                while ($this->connections->valid()) {
                                    $current_connection = $this->connections->current();
                                    $current = $this->clients->current();
                                    // subscribe to topic new connection
                                    if ($current->resourceId == $from->resourceId) {
                                        $current->topic = $message->topic;
                                        $current->userId = $message->sender_id;
                                        // dont notify to just connected -because he already knows it
                                        $this->clients->next();
                                        $this->connections->next();
                                        echo "Connection ->" . $current->resourceId . " subscribed to topic No :" . $current->topic . "\n";
                                    }
                                    // for notification to others that 1 new connection
                                    $message->command = $this->COMMANDS['USER_WS_ONLINE'];
                                    // If connection with the same topic like in message - so this connection will receive new list of clients relevant to the topic
                                    if ($message->topic == $current->topic || $message->topic == "amnetkidcare/resource/phone/chat/" . $current->topic) {
                                        // add connection to topic
                                        $user = array("id" => $current->userId);
                                        $this->clientsInTopic[] = $user;
                                        echo "notify to --> {$current_connection->resourceId} " . " about user_id :" . json_encode($message->sender_id) . "\n";
                                        $current_connection->send(json_encode($message));
                                    }
                                    $this->clients->next();
                                    $this->connections->next();
                                }
                                //ALSO NOTIFY TO NEW CONNECTION WHO IS ONLINE
                                $message->users = json_encode($this->clientsInTopic);
                                $message->command = $this->COMMANDS['USER_WS_CONNECTED'];
                                echo "also get all online {$message->users} as users to just connected as : {$this->newConnection->resourceId} \n";
                                $this->newConnection->send(json_encode($message));
                                return;
                            case $this->COMMANDS['USER_CHAT_CONVERSATION_CREATED']:
                                // NOTIFY ADDED TO CONVERSATION
                                $message->sent = 1;
                                $this->clients->rewind();
                                $this->connections->rewind();
                                while ($this->connections->valid()) {
                                    $current_connection = $this->connections->current();
                                    $current = $this->clients->current();
                                    if ($current->userId != null) {
                                        // If connection with topic that in message - so this connection will receive that message
                                        if ($message->topic == $current->topic || $current->topic == "#" || $message->topic == "amnetkidcare/resource/phone/chat/" . $current->topic) {
                                            // if new connection created ,must notify all others in this topic about this connection by sending new list of connections to this client
                                            foreach ($message->conversation->conversation_participants as $participant) {
                                                if ($participant->participant_id == $current->userId) {
                                                    $current_connection->send(json_encode($message));
                                                    echo "Connection :" . $current->resourceId . " received ->" . $message->message . "\n";
                                                }
                                            }
                                        }
                                    }
                                    $this->clients->next();
                                    $this->connections->next();
                                }
                                return;
                            case $this->COMMANDS['MQTT_AVL_REPORT']:
                            case $this->COMMANDS['MQTT_SUBSCRIBE']:
                            $this->clients->rewind();
                            $this->connections->rewind();
                            while ($this->connections->valid()) {
                                $current_connection = $this->connections->current();
                                $current = $this->clients->current();
                                // message to public room
                                if ($message->topic == $current->topic || $current->topic == "#" || $message->topic == "amnetkidcare/resource/phone/chat/" . $current->topic) {
                                    $current_connection->send(json_encode($message));

                                    //to public room
//                                    if ($message->conversation->about == $current->topic) {
//                                        $current_connection->send(json_encode($message));
//                                    } else {
//                                        // to conversation
//                                        foreach ($message->conversation->conversation_participants as $participant) {
//                                            if ($participant->participant_id == $current->userId) {
//                                                $current_connection->send(json_encode($message));
//                                                echo "Connection :" . $current->resourceId . " received ->" . $message->message . "\n";
//                                            }
//                                        }
//                                    }
                                }
                                $this->clients->next();
                                $this->connections->next();
                            }
                            return;
                            case $this->COMMANDS['USER_WS_MESSAGE']: // 3
                            case $this->COMMANDS['USER_WS_HEARTBEAT']: // 77
                            case $this->COMMANDS['USER_CHAT_CONVERSATION_CREATED']: // 88
                            case $this->COMMANDS['USER_CHAT_CONVERSATION_LEFT']: // 99
                                $this->clients->rewind();
                                $this->connections->rewind();
                                while ($this->connections->valid()) {
                                    $current_connection = $this->connections->current();
                                    $current = $this->clients->current();
                                    // message to public room
                                    if ($message->topic == $current->topic || $current->topic == "#" || $message->topic == "amnetkidcare/resource/phone/chat/" . $current->topic) {
                                        //to public room
                                        if ($message->conversation->about == $current->topic) {
                                            $current_connection->send(json_encode($message));
                                        } else {
                                            // to conversation
                                            foreach ($message->conversation->conversation_participants as $participant) {
                                                if ($participant->participant_id == $current->userId) {
                                                    $current_connection->send(json_encode($message));
                                                    echo "Connection :" . $current->resourceId . " received ->" . $message->message . "\n";
                                                }
                                            }
                                        }
                                    }
                                    $this->clients->next();
                                    $this->connections->next();
                                }
                                return;
                            default :
                                break;
                        }
                    }
                }
            }
        } catch
        (Exception $x) {
            Log::error('bad onMessage server event : ' . $msg);
        }
    }

    public function onClose(ConnectionInterface $conn)
    {
        $stop_while = false;
        $topic = '';
        $user_id = 0;

        $this->clients->rewind();
        $this->connections->rewind();
        while ($this->connections->valid()) {
            $current_connection = $this->connections->current();
            $current = $this->clients->current();
            if ($current_connection->resourceId == $conn->resourceId) {
                echo $conn->resourceId . " disconnected !! \n";
                $topic = $current->topic;
                $user_id = $current->userId;
                $this->connections->detach($conn);
                $this->clients->detach($current);
                $stop_while = true;
            }
            if (!$stop_while) {
                $this->clients->next();
                $this->connections->next();
            } else {
                break;
            }
        }

        // if user was in chat - notify to client who disconnected
        if ($user_id != null) {
            $message = array("topic" => "#", "message" => "", "sender_id" => $user_id, "sent" => 0, "command" => $this->COMMANDS['USER_WS_DISCONNECTED']);
            $this->clients->rewind();
            $this->connections->rewind();
            echo "{$user_id} reported as disconnected : " . json_encode($message) . "\n";
            while ($this->connections->valid()) {
                $current_connection = $this->connections->current();
                $current = $this->clients->current();
                if ($topic == $current->topic || $current->topic == "#") {
                    echo "notify to {$current->userId}  that disconnected : " . json_encode($message) . "\n";
                    $current_connection->send(json_encode($message));
                }
                $this->clients->next();
                $this->connections->next();
            }
        }
    }

    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        echo "An error has occurred: {$e->getMessage()}\n";
        $conn->close();
    }


    private function verifyUser(ConnectionInterface $conn, NetworkMessage $message)
    {
        $cookies = $conn->WebSocket->request->getCookies();
        $laravel_session = rawurldecode($cookies['laravel_session']);
        $id = $this->encrypter->decrypt($laravel_session);
        $session = Session::find($id);
        $payload = unserialize(base64_decode($session->payload));
        $user_id = $payload['user_id'];
        $user = User::find($user_id);
        $characters = $this->characterService->allFrom($user);
        $character_id = $message->getHeader()['character_id'];
        return $characters->contains($character_id);
    }

    private function verifyCsrfToken($from, NetworkMessage $message)
    {
        $header = $this->getHeaderToken($from);
        return $this->verifier->tokensMatch($header, $message->getId());
    }
}