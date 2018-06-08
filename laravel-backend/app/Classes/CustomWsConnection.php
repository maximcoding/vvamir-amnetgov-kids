<?php

namespace App\Classes;

use React\Socket\ConnectionInterface;

/**
 * Created by IntelliJ IDEA.
 * User: fafa
 * Date: 9/21/2016
 * Time: 2:48 PM
 */
class CustomWsConnection
{

    public $resourceId;
    public $userId;
    public $topic;


    public function __construct($resourceId)
    {
        $this->resourceId = $resourceId;
    }

    public function getConnection()
    {
        return $this->connection;
    }

    public function getResourceId()
    {
        return $this->resourceId();
    }

    public function getTopic()
    {
        return $this->getTopic();
    }

    public function getUserId()
    {
        return $this->userId();
    }

    public function setUserId($userId)
    {
        $this->userId = $userId;
    }

    public function setTopic($topic)
    {
        $this->topic = $topic;
    }
}