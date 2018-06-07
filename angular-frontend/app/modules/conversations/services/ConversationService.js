'use strict';

angular.module('ng-laravel').service('ConversationService', function ($rootScope, $q, Restangular) {
    /*
     * Build collection /conversation
     */
    var _conversationService = Restangular.all('conversations');


    /*
     * Get list of conversations
     */
    this.list = function (topic) {
        // GET /api/conversation
        return _conversationService.getList({topic: topic});
    };

    this.listFromTime = function (topic) {
        return _conversationService.getList({from_time: true, topic: topic});
    }


    /*
     * Pagination change
     */
    this.pageChange = function (pageNumber, per_page) {
        // GET /api/conversation?page=2
        return _conversationService.getList({page: pageNumber, per_page: per_page});
    };


    /*
     * Show specific conversation by Id
     */
    this.show = function (id) {
        // GET /api/conversation/:id
        return _conversationService.get(id);
    };


    /*
     * Create conversation (POST)
     */
    this.create = function (conversation) {
        // POST /api/conversation/:id
        var defer = $q.defer();
        _conversationService.post(conversation).then(function (response) {
            defer.resolve(response);
        }, function (response) {
            defer.reject(response);
        });
        return defer.promise;
    };


    /*
     * Update conversation (PUT)
     */
    this.update = function (conversation) {
        // PUT /api/conversation/:id
        conversation.put().then(function () {
            $rootScope.$broadcast('conversation.update');
        }, function (response) {
            $rootScope.$broadcast('conversation.validationError', response.data.error);
        });
    };


    /*
     * Delete conversation
     * To delete multi record you should must use 'Restangular.several'
     */

    this.delete = function (selection) {
        // DELETE /api/conversation/:id
        Restangular.several('conversations', selection).remove().then(function () {
            $rootScope.$broadcast('conversation.delete');
        }, function (response) {
            $rootScope.$broadcast('conversation.not.delete');
        });
    };



    /*
     * Search in conversations
     */
    this.search = function (query, per_page) {
        // GET /api/conversation/search?query=test&per_page=10
        if (query != '') {
            return _conversationService.customGETLIST("search", {query: query, per_page: per_page});
        } else {
            return _conversationService.getList();
        }
    }



});

