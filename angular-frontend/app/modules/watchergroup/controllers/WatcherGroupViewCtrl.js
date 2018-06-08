"use strict";

angular.module('ng-laravel').controller('WatcherGroupViewCtrl',function($scope,$rootScope,WatcherGroupService,$stateParams,$translatePartialLoader,trans){

    $scope.previousState = $rootScope.previousState;

    /*
     * Show groupwatcher
     */
    WatcherGroupService.show($stateParams.id).then(function(groupwatcher) {
        $scope.groupwatcher = groupwatcher;
        $scope.isSaving = true;
    });

});

