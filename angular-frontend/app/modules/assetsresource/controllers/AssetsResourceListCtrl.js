"use strict";

var app = angular.module('ng-laravel', ['ui.bootstrap', 'angular-ladda']);
app.controller('AssetsResourceListCtrl', function ($scope, $rootScope,NgMap, AssetsResourceService,PointService, AssetsPersonService, AssetsVehicleService, SweetAlert, $translatePartialLoader, trans) {


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
        url: 'app/assets/img/all_maki_icons-no-bg/map-marker.svg',
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
                //  map: map,
                icon: icon_circule,
                /*{
                 path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                 scale: 7.5,
                 fillColor: point.marker_color,
                 fillOpacity: 0.8,
                 strokeWeight: 2.5,
                 strokeColor: '#033745',
                 //   scaledSize: new google.maps.Size(57, 55),
                 // url: "app/assets/img/poi.png",
                 //    scaledSize: new google.maps.Size(57, 55)
                 }*/
            });
            $scope.points.push(marker);
        });
    }


    $scope.sortType = 'imei'; // set the default sort type
    $scope.sortReverse = true;  // set the default sort order
    $scope.searchItem = '';     // set the default search/filter term

    /*
     * Pagination assetsresource list
     */
    $scope.units = [
        {'id': 10, 'label': '10'},
        {'id': 15, 'label': '15'},
        {'id': 20, 'label': '20'},
        {'id': 30, 'label': '30'},
    ]
    $scope.perPage = $scope.units[0];
    $scope.pageChanged = function (per_page) {
        AssetsResourceService.pageChange($scope.pagination.current_page, per_page.id).then(function (data) {
            $scope.assetsresources = data;
            $scope.pagination = $scope.assetsresources.metadata;
            $scope.maxSize = 5;
        });
    };


    /*
     * Get all AssetsResources
     */
    $scope.assetsresources = [];

    function initialize() {
        AssetsResourceService.list().then(function (data) {
            $scope.assetsresources = data;
            $scope.pagination = $scope.assetsresources.metadata;
            $scope.maxSize = 5;
            $scope.selection = [];
        });
    }

    initialize();


    AssetsVehicleService.list().then(function (data) {
        $scope.assetsvehicles = data;
    });

    AssetsPersonService.list().then(function (data) {
        $scope.assetspersons = data;
    });


    /**********************************************************
     * Event Listener
     **********************************************************/
    // Get list of selected assetsresource to do actions
    $scope.toggleSelection = function toggleSelection(assetsresourceId) {
        // toggle selection for a given assetsresource by Id
        var idx = $scope.selection.indexOf(assetsresourceId);
        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
        }
        // is newly selected
        else {
            $scope.selection.push(assetsresourceId);
        }
    };

    // update list when assetsresource deleted
    $scope.$on('assetsresource.delete', function () {
        initialize();
    });

    /*
     * Search in assetsresources
     */
    $scope.query = '';
    $scope.search = function (query, per_page) {
        AssetsResourceService.search(query, per_page.id).then(function (data) {
            $scope.assetsresources = data;
            $scope.pagination = $scope.assetsresources.metadata;
            $scope.maxSize = 5;
        });
    };


    /*
     * Remove selected assetsresources
     */
    $scope.delete = function (category) {
        SweetAlert.swal($rootScope.areYouSureDelete,
            function (isConfirm) {
                if (isConfirm) {
                    SweetAlert.swal($rootScope.recordDeleted);
                    AssetsResourceService.delete(category);
                }
            });
    };


});
