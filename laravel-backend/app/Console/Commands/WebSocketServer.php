<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use Ratchet\Server\IpBlackList;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use App\Classes\Socket\CustomChatSocket;


class WebSocketServer extends Command
{
    protected $signature = 'chat:serve';

    protected $description = 'Start websocket Ratchet chat';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
//        $server = IoServer::factory(
//            new HttpServer(
//                new WsServer(
//                    new CustomChatSocket()
//                )
//            ),
//            8080
//        );
        $chat =  new CustomChatSocket();
        $wsServer = new WsServer($chat);
        $httServer = new HttpServer($wsServer);
        $blackList = new IpBlackList($httServer);
        $server = IoServer::factory($blackList, 8080);
        $server->run();

    }


}
