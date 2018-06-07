"use strict";

var app = angular.module('ng-laravel');
app.controller('PointEditCtrl', function ($scope, NgMap, PointService, $stateParams, Notification, $translatePartialLoader, trans) {


        /*
         * Edit mode point
         */
        $scope.points = [];
        $scope.checked = [];
        $scope.dataTable = [];
        $scope.marker = {};
        $scope.markers = [];
        $scope.searchfield = '';
        $scope.map = '';
        $scope.image_icon = {
            url: '../assets/img/all_maki_icons-no-bg/map-marker.svg',
            scaledSize: [30, 30],
            origin: [0, 0],
        };

        PointService.show($stateParams.id).then(function (point) {
            NgMap.getMap().then(function (map) {
                $scope.map = map;
                $scope.marker = new google.maps.Marker({
                    other: point[0],
                    address: point[0].address,
                    position: new google.maps.LatLng(point[0].lat, point[0].lng),
                    title: point[0].name,
                    map: $scope.map,
                    draggable: true,
                    icon: $scope.image_icon
                    /*  icon: {
                     path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                     scale: 7.5,
                     fillColor: point[0].marker_color,
                     fillOpacity: 0.8,
                     strokeWeight: 2.5,
                     strokeColor: '#033745',
                     //   scaledSize: new google.maps.Size(57, 55),
                     // url: "../assets/img/poi.png",
                     //    scaledSize: new google.maps.Size(57, 55)
                     }*/
                });
            });

        });

        // Add Point to Checked List and delete from Unchecked List
        $scope.toggleChecked = function (index) {
            $scope.checked.push($scope.points[index]);
            $scope.points.splice(index, 1);
        };
        // Get Total Points
        $scope.getTotalPoints = function () {
            return $scope.points.length;
        };
        $scope.place = {};
        $scope.location = {country: 'co'};
        $scope.type = "['all']";
        $scope.point_address = '';
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

        //DOUBLE-CLICK EVENT ON MAP
        $scope.placeChanged = function () {
            $scope.place = this.getPlace();
            $scope.map.setCenter($scope.place.geometry.location);
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
        $scope.image = new google.maps.MarkerImage(
            $scope.place.icon,
            new google.maps.Size(20, 20),
            new google.maps.Point(0, 0),
            new google.maps.Point(20, 20),
            new google.maps.Size(20, 20)
        )
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
        $scope.save = function () {
            savePoints();
        };

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
                    window.alert('Geocoder failed due to: ' + status);
                }
                $scope.$apply();
            });
        }

        function generateIconColor() {
            default_icon.fillColor = '#' + Math.floor(Math.random() * 16777215).toString(16)
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
                point.marker.setMap($scope.map);
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


        /*
         * Delete a Point
         */
        $scope.deletePoint = function ($index, mapId) {
            angular.forEach($scope.points, function (point) {
                point.marker.setMap(null);
            });
            $scope.points.splice($index, 1);
            setMapOnAll($scope.map);
            //  $scope.map = NgMap.initMap(mapId);
        };
        /*
         * Update point
         */
        $scope.update = function (point) {
            $scope.isDisabled = true;
            PointService.update(point);
        };

        /********************************************************
         * Event Listeners
         * Point event listener related to PointEditCtrl
         ********************************************************/
        // Edit point event listener
        $scope.$on('points.edit', function (scope, point) {
            $scope.point = point;
        });

        // Update point event listener
        $scope.$on('points.update', function () {
            Notification({
                message: 'app.shared.alert.updated_successfully',
                templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
            }, 'success');
            $scope.isDisabled = false;
        });

        // Point form validation event listener
        $scope.$on('points.validationError', function (event, errorData) {
            Notification({
                message: errorData,
                templateUrl: 'app/vendors/angular-ui-notification/tpl/validation.tpl.html'
            }, 'warning');
            $scope.isDisabled = false;
        });
    }
);

