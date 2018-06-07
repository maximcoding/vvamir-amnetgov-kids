"use strict";

var app = angular.module('ng-laravel');
app.controller('MessageViewCtrl',function($scope,MessageService,$stateParams,$translatePartialLoader,trans){

    /*
     * Show message
     */
    MessageService.show($stateParams.id).then(function(message) {
        $scope.message = message;
        $scope.isSaving = true;
    });

});

