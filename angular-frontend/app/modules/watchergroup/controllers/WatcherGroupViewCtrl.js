"use strict";

var app = angular.module('ng-laravel');
app.controller('WatcherGroupViewCtrl',function($scope,$rootScope,WatcherGroupService,$stateParams,$translatePartialLoader,trans){

    $scope.previousState = $rootScope.previousState;

    /*
     * Show groupwatcher
     */
    WatcherGroupService.show($stateParams.id).then(function(groupwatcher) {
        $scope.groupwatcher = groupwatcher;
        $scope.isSaving = true;
    });

});

