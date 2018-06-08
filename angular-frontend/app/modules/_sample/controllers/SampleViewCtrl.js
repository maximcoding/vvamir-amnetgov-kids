"use strict";

angular.module('ng-laravel').controller('SampleViewCtrl',function($scope,SampleService,$stateParams,$translatePartialLoader,trans){

    /*
     * Show sample
     */
    SampleService.show($stateParams.id).then(function(sample) {
        $scope.sample = sample;
        $scope.isSaving = true;
    });

});

