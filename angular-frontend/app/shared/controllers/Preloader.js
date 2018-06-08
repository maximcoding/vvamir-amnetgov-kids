"use strict";

angular.module('ng-laravel').controller('Preloader',function($scope,$rootScope){

    $scope.$on('signinBegin', function() {
        $scope.loader = true;
    });

    $scope.$on('signinError', function() {
        $scope.loader = false;
    });
});