"use strict";


var app = angular.module('ng-laravel', ['ui.bootstrap', 'ngMap', 'sc.select', 'ui.bootstrap', 'momentjs', 'angular-ladda'])
app.controller('AssetsPersonListCtrl', function ($scope, NgMap, $rootScope, AssetsPersonService, AssetsResourceRelationService, PointService, AvlService, SweetAlert, $translatePartialLoader, trans) {


        $scope.map = {};
        $scope.point = {};
        $scope.point.avatar_url = '';
        $scope.checked = [];
        $scope.dataTable = [];
        $scope.location = {country: 'co'};
        $scope.type = "['geocode']";
        $scope.sortType = 'name'; // set the default sort type
        $scope.sortReverse = false;  // set the default sort order
        $scope.searchItem = '';     // set the default search/filter term
        $scope.query = '';
        $scope.markers = [];
        var infowindow = new google.maps.InfoWindow();
        $scope.showPointDetail = function (e, point) {
            $scope.point = point;
            $scope.map.showInfoWindow('info-id', point.other.id);
        };
        var personIcon = new google.maps.MarkerImage(
            'app/assets/img/all_maki_icons-no-bg/person5.svg',
            null, /* size is determined at runtime */
            null, /* origin is 0,0 */
            null, /* anchor is bottom center of the scaled image */
            new google.maps.Size(55, 45)
        );

        /*
         * Search in assetspersons
         */
        $scope.search = function (per_page) {
            AssetsPersonService.search($scope.query, per_page.id).then(function (response) {
                clean_all(response);
            }).then(function () {
                initialize();
            }).then(function () {
                initialize2();
            });

        }
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
            AssetsPersonService.pageChange($scope.pagination.current_page, per_page.id).then(function (response) {
                clean_all(response);
            }).then(function () {
                initialize();
            }).then(function () {
                initialize2();
            });
        };

        function reinitialize(param) {
            $scope.assetspersons = param;
            $scope.assetsresources = [];
            $scope.selected_persons = [];
            $scope.organizations = [];
            $scope.avls = [];
        }

        /*
         * Get all AssetsPersons
         */
        $scope.assetspersons = [];
        AssetsPersonService.list().then(function (response) {
            reinitialize(response);
        }).then(function () {
            angular.forEach($scope.assetspersons, function (person) {
                $scope.selected_persons.push({id: person.assets_person_id});
                $scope.organizations.push({id: person.organization_id});
            })
        }).then(function () {
            initialize2();
        });


        function initialize2() {
            AssetsResourceRelationService.listPersons($scope.selected_persons).then(function (response) {
                if (response) {
                    $scope.assetsresources = response.data;
                    angular.forEach($scope.assetspersons, function (person) {
                        person.assets_resources = [];
                        angular.forEach($scope.assetsresources, function (resource) {
                            if (resource.assets_person_id != null) {
                                if (person.assets_person_id == resource.assets_person_id) {
                                    person.assets_resources.push(resource);
                                }
                            }
                        })
                    })
                }
            }).then(function () {
                $scope.pagination = $scope.assetspersons.metadata;
                $scope.maxSize = 5;
                runQuery();
            })
        }

        function runQuery() {
            var startDate = moment().add(-120, 'days');
            var endDate = moment();
            AvlService.runQuery(
                startDate,
                endDate,
                $scope.organizations,
                [], //assets
                [], //vehicels
                $scope.selected_persons,
                0
            ).then(function (response) {
                $scope.avls = response.data;
                angular.forEach($scope.markers, function (point) {
                    point.setMap(null);
                })
            }).then(function () {
                if ($scope.avls.length) {
                    $scope.markers = [];
                    var myLatLng = new google.maps.LatLng($scope.avls[0].lat, $scope.avls[0].lng);
                    $scope.map.setCenter(myLatLng);
                    var mapOptions = {
                        zoom: 8,
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        disableDefaultUI: true
                    };
                    $scope.map.setOptions(mapOptions);
                    angular.forEach($scope.avls, function (avl) {
                        var iwContent = 'IMEI :' + avl.imei
                            + "</br>" + " Organization : " + avl.organization_name
                            + "</br>" + " " + avl.assetsperson_firstname + ' ' + avl.assetsperson_lastname;
                        var marker = new google.maps.Marker({
                            other: avl,
                            avl_id: avl.avl_id,
                            title: avl.created_at,
                            icon: personIcon,
                            position: new google.maps.LatLng(avl.lat, avl.lng),
                            map: $scope.map
                        });
                        marker.addListener('click', function () {
                            infowindow.setContent(iwContent);
                            infowindow.open(marker.map, marker);
                        });
                        $scope.markers.push(marker);
                    });
                }
            }).then(function () {
            })
        }


        /*
         * Remove selected assetspersons
         */
        $scope.delete = function (selected) {
            SweetAlert.swal($rootScope.areYouSureDelete,
                function (isConfirm) {
                    if (isConfirm) {
                        SweetAlert.swal($rootScope.recordDeleted);
                        AssetsPersonService.delete(selected);
                    }
                });
        };


        /**********************************************************
         * Event Listener
         **********************************************************/
        // Get list of selected assetsperson to do actions
        $scope.selection = [];
        $scope.toggleSelection = function toggleSelection(assetspersonId) {
            // toggle selection for a given assetsperson by Id
            var idx = $scope.selection.indexOf(assetspersonId);
            // is currently selected
            if (idx > -1) {
                $scope.selection.splice(idx, 1);
            }
            // is newly selected
            else {
                $scope.selection.push(assetspersonId);
            }
        };


        $scope.$on('mapInitialized', function (event, map) {
            map.setOptions({});
        });

        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams) {
                angular.forEach($scope.points, function (point) {
                    point.marker.setMap(null);
                });
                if ($scope.markers.length > 0) {
                    angular.forEach($scope.markers, function (marker) {
                        marker.setMap(null);
                    });
                }
            });
        // update list when assetsperson deleted
        $scope.$on('assetsperson.delete', function () {
            AssetsPersonService.list().then(function (data) {
                $scope.assetspersons = data;
                $scope.selection = [];
            });
        });


        /*
         * Remove selected organizations
         */
        $scope.activate = function (data) {
            $scope.isDisabled = true;
            AssetsPersonService.activate(data);
            SweetAlert.swal($rootScope.recordUpdated);
        };


    }
);
