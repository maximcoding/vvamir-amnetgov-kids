"use strict";

angular.module('ng-laravel').controller('AssetsCategoryViewCtrl',function($scope,AssetsCategoryService,$stateParams,$translatePartialLoader,trans){

    $scope.types = [{name: 'vehicles'}, {name: 'persons'}, {name: 'devices'}];

    /*
     * Show assetscategory
     */
    AssetsCategoryService.show($stateParams.id).then(function(assetscategory) {
        $scope.assetscategory = assetscategory;
        $scope.isSaving = true;
    });

});

