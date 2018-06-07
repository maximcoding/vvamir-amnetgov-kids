"use strict";

var app = angular.module('ng-laravel');
app.controller('AssetsResourceEditCtrl',function($scope,$rootScope,AssetsResourceService,OrganizationService,AssetsCategoryService,$stateParams,Notification,$translatePartialLoader,trans){

    $scope.previousState = $rootScope.previousState;

    /*
     * Define initial value
     */
    $scope.url ='WHdlX62vMOo8buIoczxZs134Q.jpg';


    /*
     * Edit mode assetsresource
     */
    AssetsResourceService.show($stateParams.id).then(function(assetsresource) {
        $scope.assetsresource = assetsresource;
    });


    /*
     * Update assetsresource
     */
    $scope.update = function(assetsresource) {
        $scope.isDisabled = true;
        AssetsResourceService.update(assetsresource);
    };

    /*Get list of Organizations*/
    $scope.onSelectOrganization = function ($item, $model, $label) {
        $scope.assetsresource.organization_id = $model.id;
    };
    $scope.organizations = [];
    $scope.searchOrganization = function (queryOrganization) {
        if (queryOrganization.length > 1) {
            OrganizationService.search(queryOrganization, "50").then(function (response) {
                $scope.organizations = [];
                angular.forEach(response, function (data) {
                    $scope.organizations.push(data);
                })
            });
        }
    }

    /* get list of Groups */
    var type = 'devices';
    AssetsCategoryService.list(type).then(function (data) {
        $scope.assetscategories = data;
    });




    /********************************************************
     * Event Listeners
     * AssetsResource event listener related to AssetsResourceEditCtrl
     ********************************************************/
    // Edit assetsresource event listener
    $scope.$on('assetsresource.edit', function(scope, assetsresource) {
        $scope.assetsresource = assetsresource;
    });

    // Update assetsresource event listener
    $scope.$on('assetsresource.update', function() {
        Notification({
            message: 'app.shared.alert.updated_successfully',
            templateUrl:'app/vendors/angular-ui-notification/tpl/success.tpl.html'},'success');
        $scope.isDisabled = false;
    });

    // AssetsResource form validation event listener
    $scope.$on('assetsresource.validationError', function(event,errorData) {
        Notification({message: errorData ,templateUrl:'app/vendors/angular-ui-notification/tpl/validation.tpl.html'},'warning');
        $scope.isDisabled = false;
    });
});

