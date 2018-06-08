"use strict";

var app = angular.module('ng-laravel', ['oitozero.ngSweetAlert', 'ngMap', 'dropzone', 'ui.bootstrap', 'sc.select', 'ui.bootstrap']);
app.controller('AssetsPersonEditCtrl', function ($scope, $rootScope, NgMap, AssetsPersonService, PointService, AssetsResourceRelationService, AssetsCategoryService, OrganizationService, AssetsResourceService, $stateParams, Notification, $translatePartialLoader, trans) {


    $scope.previousState = $rootScope.previousState;

    var data_resources = [];
    NgMap.getMap().then(function (map) {
        $scope.map = map;
    });

    $scope.assetsperson = {};
    $scope.assetsperson.avatar_url = '';
    $scope.resources_relations = [];
    $scope.example11settings = {
        enableSearch: true,
        scrollableHeight: '300px',
        scrollable: true,
        selectionLimit: 3,
        groupByTextProvider: function (groupValue) {
            return groupValue;
        },
        smartButtonMaxItems: 1,
        smartButtonTextConverter: function (itemText, originalItem) {
            return itemText;
        }
    };
    AssetsPersonService.show($stateParams.id).then(function (response) {
        $scope.assetsperson = response.success;
    }).then(function () {
        initResources($scope.assetsperson.organization_id);
    });

    /*Get list of AssetsResources*/
    $scope.owned_resources = [];
    var initResources = function (organization_id) {
        OrganizationService.show(organization_id).then(function (response) {
            $scope.queryOrganization = response;
        });
        AssetsResourceRelationService.list_by_id('assets_persons', $scope.assetsperson.id).then(function (relations) {
            $scope.assetsperson.selected_resources = [];
            angular.forEach(relations, function (object) {
                if (object.organization_id == $scope.assetsperson.organization_id) {
                    $scope.assetsperson.selected_resources.push({id: object.assets_resource_id});
                }
                $scope.owned_resources.push({
                    id: object.assets_resource_id,
                    label: 'IMEI :' + object.imei + ' S/N :' + object.serial,
                    category: object.assets_category_name
                });
            })
        }).then(function () {
            var type = 'humans_devices';
            AssetsResourceService.only_free_list(true, type, organization_id).then(function (response) {
                $scope.free_resources = [];
                /*PUSH FREE RESOURCE OF THIS ORGANIZATION*/
                angular.forEach(response, function (resource) {
                    $scope.free_resources.push({
                        id: resource.assets_resource_id,
                        label: 'IMEI :' + resource.imei + ' S/N :' + resource.serial,
                        category: resource.assets_category_name
                    });
                })
                /*PUSH SELECTED RESOURCE OF THIS PERSON*/
                angular.forEach($scope.owned_resources, function (resource) {
                    $scope.free_resources.push(resource);
                })
            })
        })
    };

    $scope.onSelectOrganization = function ($item, $model, $label) {
        $scope.assetsperson.organization_id = $model.id;
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


    /*Get list of Groups*/
    var category = 'humans';
    AssetsCategoryService.list(category).then(function (data) {
        $scope.assetscategories = data;
    });
    PointService.list().then(function (data) {
        $scope.points_of_int = data;
        $scope.avls = data;
    });
    $scope.update = function (assetsperson) {
        if (assetsperson.organization_id != "") {
            $scope.isDisabled = true;
            AssetsPersonService.update(assetsperson);
        }
        else {
            assetsperson.organization_id = $scope.assetsperson.organization_id;
            $scope.isDisabled = true;
            AssetsPersonService.update(assetsperson);
        }
    };

    /********************************************************
     * Event Listeners
     * AssetsPerson event listener related to AssetsPersonEditCtrl
     ********************************************************/
    // Edit assetsperson event listener
    $scope.$on('assetsperson.edit', function (scope, assetsperson) {
        $scope.assetsperson = assetsperson;
    });
    // Update assetsperson event listener
    $scope.$on('assetsperson.update', function () {
        Notification({
            message: 'app.shared.alert.created_successfully',
            templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
        }, 'success');
        $scope.isDisabled = false;
    });
    // AssetsPerson form validation event listener
    $scope.$on('assetsperson.validationError', function (event, errorData) {
        Notification({
            message: errorData,
            templateUrl: 'app/vendors/angular-ui-notification/tpl/validation.tpl.html'
        }, 'warning');
        $scope.isDisabled = false;
    });
});

