"use strict";

var app = angular.module('ng-laravel');
app.controller('PointViewCtrl',function($scope,NgMap,PointService,$stateParams,$translatePartialLoader,trans){

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

