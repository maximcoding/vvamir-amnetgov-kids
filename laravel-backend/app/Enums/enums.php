<?php
/**
 * Created by IntelliJ IDEA.
 * User: fafa
 * Date: 11/13/2016
 * Time: 4:11 PM
 */

function getCommands()
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