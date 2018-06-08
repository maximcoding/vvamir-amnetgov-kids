"use strict";

angular.module('ng-laravel').controller('AssetsResourceViewCtrl',function($scope,$rootScope,AssetsResourceService,OrganizationService,AssetsCategoryService,$stateParams,$translatePartialLoader,trans){

    $scope.previousState = $rootScope.previousState;

    /*Get list of Organizations*/
    OrganizationService.full_list().then(function (data) {
        $scope.organizations = data;
    });

    /* get list of Groups */
    var type = 'devices';
    AssetsCategoryService.list(type).then(function (data) {
        $scope.assetscategories = data;
    });
    /*
     * Show assetsresource
     */
    AssetsResourceService.show($stateParams.id).then(function(assetsresource) {
        $scope.assetsresource = assetsresource;
        $scope.isSaving = true;
    });

});

