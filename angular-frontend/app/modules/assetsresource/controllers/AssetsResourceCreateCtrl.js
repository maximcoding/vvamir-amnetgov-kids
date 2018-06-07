"use strict";

var app = angular.module('ng-laravel');
app.controller('AssetsResourceCreateCtrl', function ($scope,$rootScope, AssetsResourceService, AssetsCategoryService, OrganizationService, $translatePartialLoader, Notification, trans) {

    $scope.previousState = $rootScope.previousState;


    /*
     * Define initial value
     */
    $scope.assetsresource = {};
    $scope.assetsresource.avatar_url = '';


    $scope.device_types = [];


    $scope.device_types.push(
        {id: 1, name: 'Human Tag'},
        {id: 2, name: 'Vehicle Tag'},
        {id: 3, name: 'Gateway'},
        {id: 4, name: 'Cellular Phone'}
    );


    /*
     * Create a AssetsResource
     */
    $scope.create = function (assetsresource) {
        $scope.isDisabled = true;
        AssetsResourceService.create(assetsresource);
    };

    /* get list of Groups */
    var type = 'devices';
    AssetsCategoryService.list(type).then(function (data) {
        $scope.assetscategories = data;
    });

    /*Get list of Organizations*/
    $scope.conversations = [];
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


    /********************************************************
     * Event Listeners
     * AssetsResource event listener related to AssetsResourceCreateCtrl
     ********************************************************/
    // Create assetsresource event listener
    $scope.$on('assetsresource.create', function () {
        $scope.assetsresource = {};
        Notification({
            message: 'app.shared.alert.created_successfully',
            templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
        }, 'success');
        $scope.isDisabled = false;
    });

    //Validation error in create assetsresource event listener
    $scope.$on('assetsresource.validationError', function (event, errorData) {
        Notification({
            message: errorData,
            templateUrl: 'app/vendors/angular-ui-notification/tpl/validation.tpl.html'
        }, 'warning');
        $scope.isDisabled = false;
    });

});