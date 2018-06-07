'use strict';

angular.module('ng-laravel').service('MessageService', function ($rootScope, $q, Restangular) {
    /*
     * Build collection /message
     */
    var _messageService = Restangular.all('chatmessages');


    /*
     * Get list of messages
     */
    this.list = function (topic) {
        // GET /api/message
        return _messageService.getList({topic: topic});
    };

    this.listFromTime = function (topic) {
        return _messageService.getList({from_time: true, topic: topic});
    }


    /*
     * Pagination change
     */
    this.pageChange = function (pageNumber, per_page) {
        // GET /api/message?page=2
        return _messageService.getList({page: pageNumber, per_page: per_page});
    };


    /*
     * Show specific message by Id
     */
    this.show = function (id) {
        // GET /api/message/:id
        return _messageService.get(id);
    };


    /*
     * Create message (POST)
     */
    this.create = function (message) {
        // POST /api/message/:id
        var defer = $q.defer();
        _messageService.post(message).then(function (response) {
            defer.resolve(response);
        }, function (response) {
            defer.reject(response);
        });
        return defer.promise;
    };


    /*
     * Update message (PUT)
     */
    this.update = function (message) {
        // PUT /api/message/:id
        message.put().then(function () {
            $rootScope.$broadcast('message.update');
        }, function (response) {
            $rootScope.$broadcast('message.validationError', response.data.error);
        });
    };


    /*
     * Delete message
     * To delete multi record you should must use 'Restangular.several'
     */
    this.delete = function (selection) {
        // DELETE /api/message/id1,id2,...
        Restangular.several('message', selection).remove().then(function () {
            $rootScope.$broadcast('message.delete');
        });
    };


    /*
     * Search in messages
     */
    this.search = function (query, per_page) {
        // GET /api/message/search?query=test&per_page=10
        if (query != '') {
            return _messageService.customGETLIST("search", {query: query, per_page: per_page});
        } else {
            return _messageService.getList();
        }
    }

    var messages = [];
    var messages_counter = 0;
    this.addMessage = function(newObj) {
        messages.push(newObj);
    };
    this.setCounterNotifications = function(value){
        messages_counter = value;
    }
    this.incrementCounterNotifications = function(){
        messages_counter ++;
    }
    this.getCounterNotifications = function(){
        return messages_counter;
    }
    this.setMessages = function(array) {
        messages = array;
    };

    this.getMessages = function(){
        return messages;
    };


});

