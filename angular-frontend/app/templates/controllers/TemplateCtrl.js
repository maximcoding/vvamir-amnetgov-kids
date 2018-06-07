"use strict";

var app = angular.module('ng-laravel');
app.controller('TemplateCtrl', function ($scope, $rootScope) {
    $scope.previousState = $rootScope.previousState;
});