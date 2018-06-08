"use strict";

angular.module('ng-laravel').controller('PointViewCtrl',function($scope,NgMap,PointService,$stateParams,$translatePartialLoader,trans){

    /*
     * Show point
     */
    PointService.show($stateParams.id).then(function(point) {
        $scope.point = point;
        $scope.isSaving = true;
    });

    NgMap.getMap().then(function (map) {
        $scope.map = map;
    });

});

