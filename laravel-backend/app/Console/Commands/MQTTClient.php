<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use React\Dns\Resolver\Factory as DnsFactory;
use React\EventLoop\Factory as EventLoopFactory;
use BinSoul\Net\Mqtt\Client\React\ReactMqttClient;
use BinSoul\Net\Mqtt\Connection;
use BinSoul\Net\Mqtt\DefaultMessage;
use BinSoul\Net\Mqtt\DefaultSubscription;
use BinSoul\Net\Mqtt\Message;
use BinSoul\Net\Mqtt\Subscription;
use React\SocketClient\DnsConnector;
use React\SocketClient\TcpConnector;
use \Ratchet\RFC6455\Messaging\MessageInterface;
use \Ratchet\Client\WebSocket;
use \Ratchet\Client\Connector as RatchetConnector;
use WebSocket\Client;
use Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\User;


include 'vendor/autoload.php';


class MQTTClient extends Command
{

    protected $signature = 'mqtt:serve';
    protected $description = 'Start mqtt server listener';

    protected $wsConnInstance;
    protected $WebSocketSender;
    protected $WsIsConnected = 0;
    protected $messageObject;
    protected $messageValidator;

    public function __construct()
    {
        $this->COMMANDS = $this->getCommands();
        parent::__construct();
    }


    function isJson($string)
    {
        json_decode($string);
        return (json_last_error() == JSON_ERROR_NONE);
    }

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

    private function validateWebSocketMessage($message)
    {
        $returned = false;
        Log::info('mqtt validation event .. ' . json_encode($message));
        if (is_object(json_decode($message))) {
            $message = json_decode($message);
            switch ($message->command) {
                case $this->COMMANDS['MQTT_AVL_REPORT']:  // 11
                case $this->COMMANDS['MQTT_SUBSCRIBE']: // 10
                    $returned = true;
                    break;
                case $this->COMMANDS['USER_WS_CONNECTED']: // 1
                case $this->COMMANDS['USER_WS_MESSAGE']: // 3
                case $this->COMMANDS['USER_WS_DISCONNECTED']: // 0
                case $this->COMMANDS['USER_WS_ONLINE']: // 2
                case $this->COMMANDS['USER_WS_HEARTBEAT']: // 77
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

    public function handle()
    {
        $i = 0;
        $loop = EventLoopFactory::create();
        $this->WebSocketSender = new Client("ws://localhost:8080/"); // origin 62.219.226.39
        $loop->addPeriodicTimer(1, function () use ($loop, &$i) {
            if (!$this->WsIsConnected) {
                if (++$i > 7) {
                    $i = 0;
                    echo "trying reconnect websocket..\n";
                    $loop->stop();
                }
            } else
                $i = 0;
        });

        while (1) {
            $dnsResolverFactory = new DnsFactory();
            $connector = new DnsConnector(new TcpConnector($loop), $dnsResolverFactory->createCached('8.8.8.8', $loop));
            $mqttClient = new ReactMqttClient($connector, $loop);
            $socketReceiver = null;
            $socketReceiver = new RatchetConnector($loop);

            $socketReceiver('ws://localhost:8080/')->then(function (WebSocket $WebSocketConn) use ($mqttClient, $loop) { // origin 62.219.226.39
                $this->WsIsConnected = 1;
                $WebSocketConn->on('message', function (MessageInterface $msg) use ($mqttClient, $loop) {
                    if ($msg->getPayload() != "") {
                        $message = json_decode($msg->getPayload());
                        $mqttClient->publish(new DefaultMessage("amnetkidcare/resource/phone/chat/" . $message->topic, $msg->getPayload()))
                            ->then(function (Message $message) use ($msg) {
                                //    $message = json_decode($message->getPayload());
                                //    echo sprintf("Publish from websocket to mqtt: %s => %s\n", $message->topic, $message->message);
                            })
                            ->otherwise(function (\Exception $e) {
                                echo sprintf("Error: %s\n", $e->getMessage());
                            });
                    }
                }, function (Exception $e) use ($loop) {
                    echo "Could not connect: {$e->getMessage()}\n";
                    $loop->stop();
                });
                $WebSocketConn->on('close', function ($code = null, $reason = null) use ($WebSocketConn, $loop) {
                    echo "Connection closed ({$code} - {$reason})\n";
                    $loop->stop();
                });
                // SUBSCRIBE TO TOPIC # FOR SOCKET-RECEIVER
                $msg = array(
                    "topic" => "#",
                    "message" => "#",
                    "sender_id" => "#",
                    "sent" => 0,
                    "command" => 10);

//                message_object.topic = response.topic;
//                message_object.command = 88; // OPEN NEW CONVERSATION
//                message_object.message = 'added';
//                message_object.sender_id = $scope.user.id;
//                message_object.sent = 0;
//                message_object.token = token;


                $WebSocketConn->send(json_encode($msg));
            });


            $mqttClient->on('message', function (Message $message) {

                Log::debug(json_encode($message->getTopic()));


                if ($message->isDuplicate()) {
                    echo ' (duplicate)';
                }
                if ($message->isRetained()) {
                    echo ' (retained)';
                }
                if ($message->getPayload() != "") {
                    //$must_be = array("topic" => "", "message" => "", "sender_id" => "", "sent" => "", "command" => "");
                    //$difference = array_diff_assoc($must_be, $data);

                    //{
                    //"topic ": "#",
                    //"command":"11",
                    //"message":"#",
                    //"sender_id":"#",
                    //"sent": 0,
                    //"token":"",
                    //"avl_time":"",
                    //"resource_id":"",
                    //"serial":"",
                    //"imei":"",
                    //"distance":"",
                    //"resources":"",
                    //"lat":"",
                    //"lng":"",
                    //"speed":"",
                    //"heading":"",
                    //"gsmsignal":"",
                    //"io":"",
                    //"temperature":"",
                    //"rfid_num":"",
                    //"rfid_tags":"",
                    //"battvolt":"",
                    //"extvolt":""
                    //}

                    if ($this->validateWebSocketMessage($message->getPayload())) {
//                        $data = json_decode($message->getPayload());
//                        $msg = array(
//                            "topic" => $message->getTopic(),
//                            "message" => $data->message,
//                            "sender_id" => $data->sender_id,
//                            "sent" => $data->sent,
//                            "command" => $data->command);
                        if (!$this->WebSocketSender->isConnected()) {
                            $this->WebSocketSender = new Client("ws://62.219.226.39:8080/");
                        }
                        // $this->WebSocketSender->send(json_encode($msg));
                        $this->WebSocketSender->send($message->getPayload());
                    }
                }
            });
            $mqttClient->on('open', function () use ($mqttClient) {
                // Network connection established
                echo sprintf("Open: %s:%s\n", $mqttClient->getHost(), $mqttClient->getPort());
            });
            $mqttClient->on('close', function () use ($mqttClient, $loop) {
            });
            $mqttClient->on('connect', function (Connection $connection) {
                // Broker connected
                echo sprintf("Connect: client=%s\n", $connection->getClientID());
            });
            $mqttClient->on('disconnect', function (Connection $connection) use ($loop) {
                // Broker disconnected
                echo sprintf("Disconnect: client=%s\n", $connection->getClientID());
            });
            $mqttClient->on('warning', function (\Exception $e) {
                echo sprintf("Warning: %s\n", $e->getMessage());
            });
            $mqttClient->on('error', function (\Exception $e) use ($loop) {
                echo sprintf("Error: %s\n", $e->getMessage());
                $loop->stop();
            });
            // Connect to broker
            if (!$mqttClient->isConnected()) {
                $mqttClient->connect('iot.eclipse.org')->then(
                    function () use ($mqttClient) {
                        $mqttClient->subscribe(new DefaultSubscription('amnetkidcare/resource/phone/chat/#'))
                            ->then(function (Subscription $subscription) {
                                echo sprintf("Subscribe: %s\n", $subscription->getFilter());
                            })
                            ->otherwise(function (\Exception $e) {
                                echo sprintf("Error: %s\n", $e->getMessage());
                            });
                    }
                );
            }


            $loop->run();

            $this->WsIsConnected = 0;
            if ($mqttClient->isConnected()) {
                $mqttClient->disconnect();
            }

            echo "retrying mqtt too..  \n";

            sleep(2);

        }
    }
}

