"use strict";

angular.module('ng-laravel').controller('MessageViewCtrl',function($scope,MessageService,$stateParams,$translatePartialLoader,trans){

    /*
     * Show message
     */
    MessageService.show($stateParams.id).then(function(message) {
        $scope.message = message;
        $scope.isSaving = true;
    });

});

