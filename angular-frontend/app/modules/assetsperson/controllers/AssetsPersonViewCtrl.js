"use strict";

var app = angular.module('ng-laravel');
app.controller('AssetsPersonViewCtrl', function ($scope,$rootScope, NgMap, AssetsPersonService, PointService, OrganizationService, AssetsResourceRelationService, AssetsResourceService, AssetsCategoryService, $stateParams, $translatePartialLoader, trans) {

    $scope.previousState = $rootScope.previousState;


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

    $scope.map = '';
    $scope.showPointDetail = function (e, point) {
        $scope.point = point;
        $scope.map.showInfoWindow('foo-iw', point.id);
        //       $scope.map.panTo(e.latLng);
    };

    NgMap.getMap().then(function (map) {
        $scope.map = map;
    });

    /*Get list of Organizations*/
    OrganizationService.full_list().then(function (data) {
        $scope.organizations = data;
    });

    /*Get list of AssetsResourceService*/
    AssetsResourceService.list().then(function (data) {
        $scope.resources = data;
    });

    PointService.list().then(function (data) {
        $scope.points_of_int = data;
        $scope.avls = data;
    });


});

