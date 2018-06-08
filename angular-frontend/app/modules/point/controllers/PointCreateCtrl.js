"use strict";

var app = angular.module('ng-laravel', ['ngMap']);
app.controller('PointCreateCtrl', function ($q, $scope, $rootScope, PointService, $translatePartialLoader, NgMap, Notification, trans) {


        $scope.$on('mapInitialized', function (event, map) {
            map.setOptions({});
        });

        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams) {
                angular.forEach($scope.points, function (point) {
                    point.marker.setMap(null);
                });
            });

        var marker = {};
        var geocoder = new google.maps.Geocoder;
        var infowindow = new google.maps.InfoWindow;
        var default_icon = {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 7.5,
            fillOpacity: 0.8,
            strokeWeight: 2.5,
            strokeColor: '#033745',
            scaledSize: new google.maps.Size(57, 55),
        };
        $scope.points = [];
        var initialize = function () {
            $scope.place = {};
            $scope.point = {};
            $scope.markers = [];
            $scope.checked = [];
            $scope.searchfield = '';
            $scope.location = {country: 'co'};
            $scope.type = "['all']";
            $scope.point_address = '';
            $scope.image = new google.maps.MarkerImage(
                $scope.place.icon,
                new google.maps.Size(20, 20),
                new google.maps.Point(0, 0),
                new google.maps.Point(20, 20),
                new google.maps.Size(20, 20)
            )
        }
        initialize();

        //DOUBLE-CLICK EVENT ON MAP
        $scope.placeChanged = function () {
            $scope.place = this.getPlace();
            $scope.map.setCenter($scope.place.geometry.location);
            $scope.map.setZoom(15);
            //    marker.map = $scope.map;
            var marker = new google.maps.Marker({
                position: $scope.place.geometry.location,
                map: $scope.map,
                icon: new google.maps.MarkerImage(
                    $scope.place.icon,
                    new google.maps.Size(25, 25),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(20, 20),
                    new google.maps.Size(25, 25)
                ),
            });
            $scope.$apply();
        }
        $scope.placeMarker = function (event, icon) {
            generateIconColor();
            marker = new google.maps.Marker({
                position: event.latLng,
                map: $scope.map,
                title: '',
                draggable: true,
                icon: default_icon
            });
            getAddressAndAddPoint(geocoder, event, infowindow);
            marker.addListener('drag', updatePointPosition);
            $scope.$apply();
        }
        $scope.showPointDetail = function (e, point) {
            $scope.point = point;
            //       $scope.map.panTo(e.latLng);
            //$scope.map.showInfoWindow('foo-iw', avl.avl_id);
        };
        $scope.deletePoint = function ($index, mapId) {
            angular.forEach($scope.points, function (point) {
                point.marker.setMap(null);
            });
            $scope.points.splice($index, 1);
            setMapOnAll($scope.map);
            //  $scope.map = NgMap.initMap(mapId);
        };
        $scope.getTotalPoints = function () {
            return $scope.points.length;
        };
        $scope.save = function () {
            savePoints();
        };
        // Add Point to Checked List and delete from Unchecked List
        $scope.toggleChecked = function (index) {
            $scope.checked.push($scope.points[index]);
            $scope.points.splice(index, 1);
        };
        function generateIconColor() {
            default_icon.fillColor = '#' + Math.floor(Math.random() * 16777215).toString(16)
        }

        function drawMarkers(map, markers) {
            var _this = this,
                geocoder = new google.maps.Geocoder(),
                geocode_filetrs;
            _this.key = 0;
            _this.interval = setInterval(function () {
                _this.markerData = markers[_this.key];
                geocoder.geocode({address: _this.markerData.address}, yourCallback(_this.markerData));
                _this.key++;

                if (!markers[_this.key]) {
                    clearInterval(_this.interval);
                }

            }, 300);
        }

        function getAddressAndAddPoint(geocoder, event, infowindow) {
            geocoder.geocode({'location': event.latLng}, function (results, status) {
                if (status === 'OK') {
                    if (results[1]) {
                        infowindow.setContent(results[1].formatted_address);
                        infowindow.open($scope.map, marker);
                        $scope.points.push({
                            marker: marker,
                            name: $scope.name,
                            address: results[1].formatted_address,
                            //   icon: place.icon
                        });
                    } else {
                        window.alert('No results found');
                    }
                } else {
                    window.alert('Address not found: ' + status);
                }
                $scope.$apply();
            });
        }

        function updatePointPosition() {
            var randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
            var default_icon = {
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                scale: 7.5,
                fillColor: randomColor,
                fillOpacity: 0.8,
                strokeWeight: 2.5,
                strokeColor: '#033745',
                scaledSize: new google.maps.Size(57, 55),
            };
            marker.icon = default_icon;
            $scope.$apply();
        }

        // Sets the map on all markers in the array.
        function setMapOnAll(map) {
            angular.forEach($scope.points, function (point) {
                point.marker.setMap(map);
            });
        }

        function savePoints() {
            $scope.data = [];
            $scope.isDisabled = true;
            var defer = $q.defer();
            var promises = [];

            function lastTask() {
                PointService.create($scope.data);
                defer.resolve();
            }

            angular.forEach($scope.points, function (point) {
                $scope.data.push({
                    name: point.name,
                    address: point.address,
                    lat: point.marker.position.lat(),
                    lng: point.marker.position.lng(),
                    marker_icon: point.marker.icon.fillColor,
                    description: point.description
                })
                promises.push($scope.data);
            });

            $q.all(promises).then(lastTask);

            return defer.promise;
        }

        /********************************************************
         * Event Listeners
         * Point event listener related to PointCreateCtrl
         ********************************************************/
        $scope.$on('points.create', function () {
            $scope.point = {};
            Notification({
                message: 'app.shared.alert.created_successfully',
                templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
            }, 'success');
            $scope.isDisabled = false;
        });
        $scope.$on('points.pointDeleted', function () {
            $scope.point = {};
            Notification({
                message: 'category.form.categoryAddSuccess',
                templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
            }, 'success');
            $scope.isDisabled = false;
        });
        $scope.$on('points.validationError', function (event, errorData) {
            Notification({
                message: errorData,
                templateUrl: 'app/vendors/angular-ui-notification/tpl/validation.tpl.html'
            }, 'warning');
            $scope.isDisabled = false;
        });


    }
)
;