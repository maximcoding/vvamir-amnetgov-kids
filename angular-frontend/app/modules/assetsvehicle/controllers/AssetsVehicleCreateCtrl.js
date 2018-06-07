"use strict";

var app = angular.module('ng-laravel', ['ui.bootstrap', 'sc.select', 'ui.bootstrap']);

app.controller('AssetsVehicleCreateCtrl', function ($scope, AssetsVehicleService,$rootScope, AssetsResourceService, OrganizationService, AssetsCategoryService, $translatePartialLoader, Notification, trans) {

    $scope.previousState = $rootScope.previousState;


    /*
     * Define initial value
     */
    $scope.assetsvehicle = {};
    $scope.assetsvehicle.avatar_url = '';
    $scope.assetsvehicle.selected_resources = [];
    $scope.example11settings = {
        enableSearch: true,
        scrollableHeight: '300px',
        scrollable: true,
        groupByTextProvider: function (groupValue) {
            return groupValue;
        }
    };
    /*Get list of AssetsResources*/

    $scope.onSelectOrganization = function ($item, $model, $label) {
        $scope.assetsvehicle.organization_id = $model.id;
        var type = 'vehicles_devices';
        AssetsResourceService.only_free_list(true, type, $model.id).then(function (response) {
            $scope.free_resources = [];
            $scope.assetsvehicle.selected_resources = [];
            angular.forEach(response, function (free) {
                $scope.free_resources.push({
                    id: free.assets_resource_id,
                    label: 'IMEI: ' + free.imei + ' S/N: ' + free.serial,
                    category: free.assets_category_name
                });
            });
        });
    };

    $scope.searchOrganization = function () {
        if ($scope.queryOrganization.length > 1) {
            OrganizationService.search($scope.queryOrganization, "50").then(function (response) {
                $scope.organizations = [];
                angular.forEach(response, function (data) {
                    $scope.organizations.push(data);
                })
            });
        }
    }


    /*Get list of Groups*/
    var category = 'vehicles';
    $scope.assetscategories = [];
    AssetsCategoryService.list(category).then(function (data) {
        $scope.assetscategories = data;
    });
    /*
     * Create a Assetsvehicle
     */
    $scope.create = function (assetsvehicle) {
        //    $scope.isDisabled = true;
        AssetsVehicleService.create(assetsvehicle);
        initResources();
    };

    $scope.placeChanged = function () {
        $scope.place = this.getPlace();
    }
    /*Get list of Organizations*/
    OrganizationService.full_list().then(function (data) {
        $scope.organizations = data;
    });

    /*Get list of Persons*/
    AssetsVehicleService.list().then(function (data) {
        $scope.assetsvehicles = data;
    });

    /********************************************************
     * Event Listeners
     * AssetsPerson event listener related to AssetsPersonCreateCtrl
     ********************************************************/
// Create assetsvehicle event listener
    $scope.$on('assetsvehicle.create', function () {
        $scope.assetsvehicle = {};
        $scope.free_resources = [];
        Notification({
            message: 'app.shared.alert.created_successfully',
            templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
        }, 'success');
        $scope.isDisabled = false;
    });
//Validation error in create assetsvehicle event listener
    $scope.$on('assetsvehicle.validationError', function (event, errorData) {
        Notification({
            message: errorData,
            templateUrl: 'app/vendors/angular-ui-notification/tpl/validation.tpl.html'
        }, 'warning');
        $scope.isDisabled = false;
    });
})
;