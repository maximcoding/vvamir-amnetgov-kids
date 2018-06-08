"use strict";

var app = angular.module('ng-laravel', ['ui.bootstrap', 'ngMap', 'sc.select', 'ui.bootstrap', 'momentjs'])
app.controller('AssetsVehicleListCtrl', function ($rootScope,NgMap, AssetsVehicleService, AssetsResourceRelationService, OrganizationService, AssetsResourceService, AssetsCategoryService, PointService, $scope, SweetAlert, $translatePartialLoader, trans) {


    initialize();

    $scope.point = {};
    $scope.point.avatar_url = '';
    $scope.checked = [];
    $scope.dataTable = [];
    $scope.markers = [];
    $scope.location = {country: 'co'};
    $scope.type = "['geocode']";
    $scope.sortType = 'name'; // set the default sort type
    $scope.sortReverse = false;  // set the default sort order
    $scope.searchItem = '';     // set the default search/filter term
    $scope.query = '';
    $scope.points = [];
    $scope.map = {};
    /*
     * Pagination vehicles list
     */
    $scope.units = [
        {'id': 10, 'label': '10'},
        {'id': 15, 'label': '15'},
        {'id': 20, 'label': '20'},
        {'id': 30, 'label': '30'}
    ];
    $scope.perPage = $scope.units[0];
    $scope.assetsvehicles = [];
    $scope.assetsresources = [];
    $scope.selection = [];
    $scope.showPointDetail = function (e, point) {
        $scope.point = point;
        $scope.map.showInfoWindow('info-id', point.other.id);
    };
    var icon_circule = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 14,
        strokeWeight: 1,
        fillColor: 'blue',
        fillOpacity: .5
    };
    $scope.image_icon = {
        url: '../assets/img/all_maki_icons-no-bg/map-marker.svg',
        scaledSize: [30, 30],
        origin: [0, 0]
    };
    PointService.list().then(function (data) {
        initialize(data, data.metadata);
    });
    function initialize(data, metadata) {
        $scope.points = [];
        $scope.pagination = metadata;
        $scope.maxSize = 5;
        angular.forEach(data, function (point) {
            var marker = new google.maps.Marker({
                other: point,
                position: new google.maps.LatLng(point.lat, point.lng),
                title: point.name,
                map: $scope.map,
                icon: icon_circule,
                /*{
                 path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                 scale: 7.5,
                 fillColor: point.marker_color,
                 fillOpacity: 0.8,
                 strokeWeight: 2.5,
                 strokeColor: '#033745',
                 //   scaledSize: new google.maps.Size(57, 55),
                 // url: "../assets/img/poi.png",
                 //    scaledSize: new google.maps.Size(57, 55)
                 }*/
            });
            $scope.points.push(marker);
        });
    }
    $scope.pageChanged = function (per_page) {
        AssetsVehicleService.pageChange($scope.pagination.current_page, per_page.id).then(function (data) {
            $scope.assetsvehicles = data;
            $scope.pagination = $scope.assetsvehicles.metadata;
            $scope.maxSize = 5;
        });
    };
    AssetsVehicleService.list().then(function (data) {
        $scope.assetsvehicles = data;
        AssetsResourceRelationService.list().then(function (data) {
            $scope.assetsresources = data;
        }).then(function () {
            angular.forEach($scope.assetsvehicles, function (vehicle) {
                vehicle.assets_resources = [];
                angular.forEach($scope.assetsresources, function (resource) {
                    if (vehicle.id == resource.assets_vehicle_id) {
                        vehicle.assets_resources.push(resource);
                    }
                })
            })
        }).then(function () {
            $scope.pagination = $scope.assetsvehicles.metadata;
            $scope.maxSize = 5;
        })
    });
    /*
     * Remove selected assetsvehicles
     */
    $scope.delete = function (category) {
        SweetAlert.swal($rootScope.areYouSureDelete,
            function (isConfirm) {
                if (isConfirm) {
                    SweetAlert.swal($rootScope.recordDeleted);
                    AssetsVehicleService.delete(category);
                }
            });
    };
    /*Get list of Groups*/
    AssetsCategoryService.list().then(function (data) {
        $scope.assetsclasss = data;
    });
    /*
     * Search in assetsvehicles
     */
    $scope.search = function (per_page) {
        AssetsVehicleService.search($scope.query, per_page.id).then(function (data) {
            $scope.assetsvehicles = data;
            $scope.pagination = $scope.assetsvehicles.metadata;
            $scope.maxSize = 5;
        });
    };
    /*
     * Remove selected organizations
     */
    $scope.activate = function (organization) {
        $scope.isDisabled = true;
        AssetsVehicleService.activate(organization);
        SweetAlert.swal($rootScope.recordUpdated);
    };
    /**********************************************************
     * Event Listener
     **********************************************************/
// Get list of selected assetsvehicle to do actions
    $scope.toggleSelection = function toggleSelection(assetsvehicleId) {
        // toggle selection for a given assetsvehicle by Id
        var idx = $scope.selection.indexOf(assetsvehicleId);
        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
        }
        // is newly selected
        else {
            $scope.selection.push(assetsvehicleId);
        }
    };
// update list when assetsvehicle deleted
    $scope.$on('assetsvehicle.delete', function () {
        AssetsVehicleService.list().then(function (data) {
            $scope.assetsvehicles = data;
            $scope.selection = [];
        });
    });


});
