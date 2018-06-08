"use strict";

angular.module('ng-laravel').controller('AssetsGroupDetailsViewCtrl',function($scope,AssetsGroupDetailsService,$stateParams,$translatePartialLoader,trans){

    /*
     * Show data
     */
    AssetsGroupDetailsService.show($stateParams.id).then(function(data) {
        $scope.assetsdetailsgroup = data;
        $scope.isSaving = true;
    });

});

