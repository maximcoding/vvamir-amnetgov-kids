"use strict";

angular.module('ng-laravel').controller('TemplateCtrl', function ($scope, $rootScope) {
    $scope.previousState = $rootScope.previousState;
});