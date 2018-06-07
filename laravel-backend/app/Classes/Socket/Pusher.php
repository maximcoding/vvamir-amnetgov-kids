<?php
/**
 * Created by IntelliJ IDEA.
 * User: fafa
 * Date: 9/19/2016
 * Time: 2:24 PM
 */

namespace App\Classes\Socket;


use ZMQContext;
use App\Classes\Socket\Base\BasePusher;



class Pusher extends BasePusher
{

    /*
     *  Sends data to PushServer for Retranslate to Subscribers
     * */
    static function sendDataTOSever(array $data)
    {

    }

    /*
     * Sends data to those who subscribed to topic
     * */
    public function broadcast($jsonDataToSend)
    {

        $aDataToSend = json_decode($jsonDataToSend, true);
        $subscribedTopics = $this->getSubscribeTopics();

        if (isset($subscribedTopics[$aDataToSend['topic_id']])) {
            $topic = $subscribedTopics[$aDataToSend['topic_id']];
            $topic->broadcast($aDataToSend);
        }
    }
}