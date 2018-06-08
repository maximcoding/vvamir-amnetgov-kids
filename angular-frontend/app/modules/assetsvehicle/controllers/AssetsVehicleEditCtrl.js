"use strict";

var app = angular.module('ng-laravel', ['ui.bootstrap', 'sc.select']);
app.controller('AssetsVehicleEditCtrl', function ($scope, AssetsVehicleService, $rootScope, OrganizationService, AssetsResourceService, AssetsResourceRelationService, AssetsCategoryService, $stateParams, Notification, $translatePartialLoader, trans) {

    $scope.previousState = $rootScope.previousState;
    /*
     * Define initial value
     */
    $scope.assetsvehicle = {};
    $scope.assetsvehicle.avatar_url = '';
    $scope.resources_relations = [];
    $scope.example11settings = {
        enableSearch: true,
        scrollableHeight: '300px',
        scrollable: true,
        groupByTextProvider: function (groupValue) {
            return groupValue;
        },
        selectionLimit: 10
    };
    /*
     * Edit mode assetsvehicle
     */
    AssetsVehicleService.show($stateParams.id).then(function (assetsvehicle) {
        $scope.assetsvehicle = assetsvehicle;
    }).then(function () {
        initResources($scope.assetsvehicle.organization_id);
    });
    /*Get list of AssetsResources*/
    $scope.owned_resources = [];
    var initResources = function (organization_id) {
        OrganizationService.show(organization_id).then(function (response) {
            $scope.queryOrganization = response;
        });
        AssetsResourceRelationService.list_by_id('assets_vehicles', $scope.assetsvehicle.id).then(function (relations) {
            $scope.assetsvehicle.selected_resources = [];
            angular.forEach(relations, function (object) {
                if (object.organization_id == $scope.assetsvehicle.organization_id) {
                    $scope.assetsvehicle.selected_resources.push({id: object.assets_resource_id});
                }
                $scope.owned_resources.push({
                    id: object.assets_resource_id,
                    label: 'IMEI :' + object.imei + ' S/N :' + object.serial,
                    category: object.assets_category_name
                });
            })
        }).then(function () {
            var type = 'vehicles_devices';
            AssetsResourceService.only_free_list(true, type, $scope.assetsvehicle.organization_id).then(function (response) {
                $scope.free_resources = [];
                /*PUSH FREE RESOURCES OF THIS ORGANIZATION*/
                angular.forEach(response, function (resource) {
                    $scope.free_resources.push({
                        id: resource.assets_resource_id,
                        label: 'IMEI :' + resource.imei + ' S/N :' + resource.serial,
                        category: resource.assets_category_name
                    });
                })
                /*PUSH SELECTED (OWNED BY VEHICLE) RESOURCES OF THIS ORGANIZATION*/
                angular.forEach($scope.owned_resources, function (resource) {
                    $scope.free_resources.push(resource);
                })
            })
        });
    };


    $scope.onSelectOrganization = function ($item, $model, $label) {
        $scope.assetsvehicle.organization_id = $model.id;
        initResources($model.id);
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

    $scope.update = function (assetsvehicle) {
        if (assetsvehicle.organization_id != "") {
            $scope.isDisabled = true;
            AssetsVehicleService.update(assetsvehicle);
        }
        else {
            assetsvehicle.organization_id = $scope.assetsvehicle.organization_id;
            $scope.isDisabled = true;
            AssetsVehicleService.update(assetsvehicle);
        }
    };
    var category = 'vehicles';
    AssetsCategoryService.list(category).then(function (data) {
        $scope.assetscategories = data;
    });

    /********************************************************
     * Event Listeners
     * AssetsVehicle event listener related to AssetsVehicleEditCtrl
     ********************************************************/
    // Edit assetsvehicle event listener
    $scope.$on('assetsvehicle.edit', function (scope, assetsvehicle) {
        $scope.assetsvehicle = assetsvehicle;
    });

    // Update assetsvehicle event listener
    $scope.$on('assetsvehicle.update', function () {
        Notification({
            message: 'app.shared.alert.updated_successfully',
            templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
        }, 'success');
        $scope.isDisabled = false;
    });

    // AssetsVehicle form validation event listener
    $scope.$on('assetsvehicle.validationError', function (event, errorData) {
        Notification({
            message: errorData,
            templateUrl: 'app/vendors/angular-ui-notification/tpl/validation.tpl.html'
        }, 'warning');
        $scope.isDisabled = false;
    });
});

