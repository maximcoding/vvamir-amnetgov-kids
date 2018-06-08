"use strict";

var app = angular.module('ng-laravel', ['ui.bootstrap', 'ngMap']);
app.controller('PointListCtrl', function ($scope, $rootScope, NgMap, PointService, SweetAlert, Notification, $translatePartialLoader, trans) {

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
                 // url: "../assets/img/poi.png",
                 //    scaledSize: new google.maps.Size(57, 55)
                 }*/
            });
            $scope.points.push(marker);
        });
    }


    /*
     * Pagination point list
     */
    $scope.units = [
        {'id': 10, 'label': '10'},
        {'id': 15, 'label': '15'},
        {'id': 20, 'label': '20'},
        {'id': 30, 'label': '30'},
    ]
    $scope.perPage = $scope.units[0];
    $scope.pageChanged = function (per_page) {
        PointService.pageChange($scope.pagination.current_page, per_page.id).then(function (data) {
            initialize(data, data.metadata);
        });
    };


    /*
     * Search in points
     */
    $scope.search = function (per_page) {
        PointService.search($scope.query, per_page.id).then(function (data) {
            initialize(data, data.metadata);
        });
    };


    /**********************************************************
     * Event Listener
     **********************************************************/
// Get list of selected point to do actions
    $scope.selection = [];
    $scope.toggleSelection = function toggleSelection(pointId) {
        // toggle selection for a given point by Id
        var idx = $scope.selection.indexOf(pointId);
        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
        }
        // is newly selected
        else {
            $scope.selection.push(pointId);
        }
    };

    $rootScope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams) {
            angular.forEach($scope.points, function (point) {
                point.setMap(null);
            });
        })

// update list when point deleted
    $scope.$on('points.delete', function () {
        initialize();
        $scope.selection = [];
    });

    /*
     * Remove selected points
     */
    $scope.delete = function (selected) {
        if (selected.length > 0) {
            SweetAlert.swal($rootScope.areYouSureDelete,
                function (isConfirm) {
                    if (isConfirm) {
                        SweetAlert.swal($rootScope.recordDeleted);
                        PointService.delete(selected);
                    }
                });
        } else {
            Notification({
                message: 'app.shared.alert.at_least_one',
                templateUrl: 'app/vendors/angular-ui-notification/tpl/notice.tpl.html'
            }, 'default');
            $scope.isDisabled = false;
        }
    };
})
;
