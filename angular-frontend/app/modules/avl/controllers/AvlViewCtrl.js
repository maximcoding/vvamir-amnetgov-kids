"use strict";
var app = angular.module('ng-laravel', ['ui.bootstrap', 'ngMap', 'sc.select', 'ui.bootstrap', 'momentjs', 'angular-ladda'])

app.controller('AvlViewCtrl', function ($scope, $stateParams, $cookies, $auth, $localStorage, AssetsResourceRelationService, RoleService, AssetsVehicleService, AssetsPersonService, ngProgressFactory, AvlService, $filter, $timeout, $rootScope, $q, $http, AssetsCategoryService, OrganizationService, SweetAlert, NgMap, Notification, $translatePartialLoader, trans) {


    $rootScope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams) {
            angular.forEach($scope.markers, function (point) {
                point.setMap(null);
            });
        })

    init();
    $scope.query = '';
    /*    $scope.sortType = 'name'; // set the default sort type
     $scope.sortReverse = false;  // set the default sort order
     $scope.searchItem = '';     // set the default search/filter term*/
    $scope.avl = {};
    $scope.avl.avatar_url = '';
    // Avl List Arrays
    $scope.avls = [];
    $scope.assets_vehicles = [];
    $scope.assets_persons = [];


    // var timer_backup = function () {
    //     $timeout(saveForm, 1000);
    // }

    /*
     * Search in organizations
     */
    $scope.filterOrganization = '';
    var organizanion_name = '';
    var timer_search_text;
    $scope.organizations = [];
    function searchOrg(text_as_event) {
        AvlService.search(text_as_event).then(function (response) {
            $scope.organizations = [];
            angular.forEach(response, function (data) {
                if (organizanion_name != null) {
                    $scope.organizations.push({
                        id: data.organization_id,
                        label: data.organization_name
                    });
                }
            })
        })
    }

    if ($stateParams.id) {
        $scope.organizations = [];
        OrganizationService.show($stateParams.id).then(function (organization) {
            $scope.organizations.push({
                id: organization.organization_id,
                label: organization.organization_name
            });
        })
    }


    $scope.$watch('filterOrganization', function (text_as_event) {
        if (text_as_event.length > 2) {
            $scope.temp_text = text_as_event;
            $timeout.cancel(timer_search_text);
            timer_search_text = $timeout(searchOrg, 1000, true, text_as_event);
        }
        if (text_as_event.length < 1) {
        }
    })
    $scope.dateRangeOptions = {
        maxDate: moment(),
        minDate: moment().subtract(80, "days"),
        //    opens: (string: 'left'/'right'/'center')
        opens: 'right',
        //drops (string: 'down' or 'up')
        showDropdowns: true,
        //    showWeekNumbers: true,
        //     showISOWeekNumbers: true,
        autoUpdateInput: true,
        //   timePicker: true,
        autoApply: true,
        showCustomRangeLabel: true,
        /*   locale: {
         //     format: 'DD/MM/YYYY',
         //    applyLabel: "Použít",
         //    fromLabel: "Od",
         //     toLabel: "Do",
         //     cancelClass: "btn btn-danger",
         //   cancelLabel: 'Zrušit',
         //     customRangeLabel: 'Vlastní rozsah',
         //     daysOfWeek: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
         //    monthNames: ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září',
         //        'Říjen', 'Listopad', 'Prosinec'
         //    ]
         },*/
        ranges: {
            'Today': [moment().add(0, 'days').format('YYYY-MM-DD 00:00:01'), moment().format('YYYY-MM-DD hh:mm:ss a')],
            'Yesterday': [moment().add(-1, 'days').format('YYYY-MM-DD 00:00:01'), moment().format('YYYY-MM-DD 00:00:00')],
            'Last 7 Days': [moment().add(-6, 'days').format('YYYY-MM-DD 00:00:00'), moment().format('YYYY-MM-DD hh:mm:ss')],
            'Last 30 Days': [moment().add(-29, 'days').format('YYYY-MM-DD 00:00:00'), moment().format('YYYY-MM-DD hh:mm:ss')],
            'This month': [moment().startOf('month').format('YYYY-MM-DD 00:00:00'), moment().format('YYYY-MM-DD hh:mm:ss')],
            'This year': [moment('2016-01-01 00:00:00'), moment().format('YYYY-MM-DD hh:mm:ss')]
        },
        eventHandlers: {
            'apply.daterangepicker': function () {
            }
        }
    };
    $scope.map = {};
    $scope.marker = {};
    $scope.markers = [];
    $scope.location = {country: 'co'};
    $scope.type = "['geocode']";
    $scope.organizationSettings = {
        externalIdProp: '',
        closeOnSelect: false,
        closeOnBlur: false,
        showCheckAll: true,
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        buttonDefaultText: 'Organizations',
    };
    $scope.assetsSettings = {
        externalIdProp: '',
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        checkboxes: true,
        buttonDefaultText: 'Assets',
    };
    $scope.assetsVehicles = {
        externalIdProp: '',
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        checkboxes: true,
        buttonDefaultText: 'Vehicles',
    };
    $scope.assetsPersons = {
        externalIdProp: '',
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        checkboxes: true,
        buttonDefaultText: 'Persons',
    };
    $scope.customFilter = '';
    $scope.selection = [];
    var events = {
        'bounds_changed': 'fired when the viewport bounds have changed.',
        'center_changed': 'fired when the map center property changes.',
        'click': 'fired when the user clicks on the map (but not when they click on a marker or infowindow).',
        'dblclick': 'fired when the user double-clicks on the map. Note that the click event will also fire, right before this one.',
        'drag': 'repeatedly fired while the user drags the map.',
        'dragend': 'fired when the user stops dragging the map.',
        'dragstart': 'fired when the user starts dragging the map.',
        'heading_changed': 'fired when the map heading property changes.',
        'idle': 'fired when the map becomes idle after panning or zooming.',
        'maptypeid_changed': 'fired when the mapTypeId property changes.',
        'mousemove': 'fired whenever the user\'s mouse moves over the map container.',
        'mouseout': 'fired when the user\'s mouse exits the map container.',
        'mouseover': 'fired when the user\'s mouse enters the map container.',
        'projection_changed': 'fired when the projection has changed.',
        'resize': 'Developers should trigger this event on the map when the div changes size: google.maps.event.trigger(map, \'resize\') .',
        'rightclick': 'fired when the DOM contextmenu event is fired on the map container.',
        'tilesloaded': 'fired when the visible tiles have finished loading.',
        'tilt_changed': 'fired when the map tilt property changes.',
        'zoom_changed': 'fired when the map zoom property changes.'
    };
    var personIcon = new google.maps.MarkerImage(
        'app/assets/img/all_maki_icons-no-bg/person5.svg',
        null, /* size is determined at runtime */
        null, /* origin is 0,0 */
        null, /* anchor is bottom center of the scaled image */
        new google.maps.Size(55, 45)
    );
    var busIcon = new google.maps.MarkerImage(
        'app/assets/img/all_maki_icons-no-bg/bus5.svg',
        null, /* size is determined at runtime */
        null, /* origin is 0,0 */
        null, /* anchor is bottom center of the scaled image */
        new google.maps.Size(63, 50)
    );
    var infowindow = new google.maps.InfoWindow();
    $scope.clear = function () {
        $scope.selectedOrganization = null;
        $scope.selectedAsset = null;
        $scope.selectedDates = null;
    };
    $scope.organizationEvents = {
        onItemSelect: function (checked_org) {
            AssetsVehicleService.list_by_id(checked_org.id).then(function (response) {
                $scope.organization_vehicles = [];
                $scope.organization_vehicles = response;
                $scope.selectedVehicles = [];
                $scope.assets_vehicles = [];
                var assets_vehicle = {};
                angular.forEach(response, function (vehicle) {
                    assets_vehicle = {
                        id: vehicle.id,
                        label: vehicle.model + ' : ' + vehicle.plate,
                        category: vehicle.assets_category_name
                    };
                    if (vehicle.vehicle_resources.length > 0) {
                        $scope.assets_vehicles.push(assets_vehicle);
                    }
                })
                if ($scope.assets_vehicles.length == 0) {
                    assets_vehicle = {
                        id: 1,
                        label: 'No Reports',
                        category: ''
                    };
                }
            });
        },
        onItemDeselect: function (item) {
        },
        onDeselectAll: function () {
        },
        onSelectAll: function () {

        }
    };

    $scope.vehicleEvents = {
        onItemSelect: function (checked_vehicle) {
            angular.forEach($scope.organization_vehicles, function (vehicle) {
                if (vehicle.id == checked_vehicle.id) {
                    console.log(vehicle);
                    $scope.selectedAssets = [];
                    $scope.assets_categories = [];
                    var assets_category = {};
                    if (vehicle.vehicle_resources.length > 0) {
                        angular.forEach(vehicle.vehicle_resources, function (resource) {
                            assets_category = {
                                id: resource.id,
                                label: resource.assets_category_name,
                                category: vehicle.assets_category_name
                            };
                            $scope.assets_categories.push(assets_category);
                        })
                    }
                }
            })
        },
        onItemDeselect: function (item) {
        },
        onDeselectAll: function () {
        },
        onSelectAll: function () {

        }
    };


    //Escuela Naval Admirante Padilla
    $scope.runQuery = function runQuery() {
        $scope.progressbar = ngProgressFactory.createInstance();
        $scope.progressbar.stop();
        AvlService.runQuery($scope.dateRange.startDate, $scope.dateRange.endDate, $scope.selectedOrganizations, $scope.selectedAssets).then(function (response) {
            $scope.saveForm();
            $scope.progressbar.start();
            initDropdown(response.data);
        }).then(function () {
            $scope.progressbar.complete();
        });
    }

    /*
     * Create a Avl
     */
    $scope.create = function (avl) {
        $scope.isDisabled = true;
        AvlService.create(avl);
    };
    /*   $scope.placeChanged = function () {
     $scope.place = this.getPlace();
     $scope.map.setCenter($scope.place.geometry.location);
     }*/

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
    $scope.placeMarker = function (e) {
        $scope.marker = new google.maps.Marker({position: e.latLng, map: $scope.map});
        // center avl to map
        //  $scope.map.panTo(e.latLng);
    }
// This event listener will call addMarker() when the map is clicked.
    /* $scope.map.addListener('click', function (event) {
     addMarker(event.latLng);
     });*/
// Adds a marker at the center of the map.
//    addMarker(haightAshbury);
// Adds a marker to the map and push to the array.
    function addMarker(location) {
        var marker = new google.maps.Marker({
            position: location,
            map: $scope.map
        });
        markers.push(marker);
    }

// Deletes all markers in the array by removing references to them.
    function deleteMarkers() {
        if ($scope.avl_tracks.length > 0) {
            clearMarkers();
            $scope.avl_tracks = [];
        }
    }

// Removes the markers from the map, but keeps them in the array.
    function clearMarkers() {
        setMapOnAll(null);
    }

    function deleteMarker($index, marker) {
        $scope.markers.splice($index, 1);
        $scope.$emit('avlDeleted', marker);
    }

// Sets the map on all markers in the array.
    function setMapOnAll(map) {
        for (var i = 0; i < $scope.avl_tracks.length; i++) {
            $scope.avl_tracks[i].setMap(map);
        }
    }

// Shows any markers currently in the array.
    function showMarkers() {
        setMapOnAll($scope.map);
    }


    $scope.saveForm = function () {
        $localStorage.data.avl = {};
        $localStorage.data.avl.dateRange = $scope.dateRange;
        $localStorage.data.avl.selectedOrganizations = $scope.selectedOrganizations;
        $localStorage.data.avl.selectedAssets = $scope.selectedAssets;
        $localStorage.data.avl.selectedVehicles = $scope.selectedVehicles;
        $localStorage.data.avl.selectedPersons = $scope.selectedPersons;

        console.log($localStorage.data.avl);
    };

    $scope.dateRange = {
        startDate: moment().add(-1, 'days'),
        endDate: moment()
    };
    function init() {
        $scope.selectedVehicles = [];
        $scope.selectedPersons = [];
        $scope.selectedAssets = [];
        $scope.selectedOrganizations = [];
        if ($localStorage.data.avl && $localStorage.data.avl !== undefined) {
            $scope.dateRange = $localStorage.data.avl.dateRange;
            $scope.selectedOrganizations = $localStorage.data.avl.selectedOrganizations;
            $scope.selectedAssets = $localStorage.data.avl.selectedAssets;
            $scope.selectedPersons = $localStorage.data.avl.selectedPersons;
            $scope.selectedVehicles = $localStorage.data.avl.selectedVehicles;
        }
        else {
            $scope.user = $auth.getProfile().$$state.value;
            RoleService.show($scope.user.id).then(function (role) {
                if (role.name !== 'administrators') {
                    $scope.selectedOrganizations.push({id: $scope.user.organization_id});
                }
            });
        }
    }

    AssetsCategoryService.list('devices').then(function (response) {
        $scope.assets_categories = [];
        var assets_category = {};
        angular.forEach(response, function (category) {
            assets_category = {
                id: category.id,
                label: category.name
            };
            $scope.assets_categories.push(assets_category);
        })
    })

    NgMap.getMap().then(function (map) {
        $scope.map = map;
    });


    function initDropdown(data) {
        angular.forEach($scope.markers, function (response) {
            response.setMap(null);
        })
        $scope.avl_tracks = [];
        $scope.avls = data;
        //   var assets_category = {};
        /*      angular.forEach(data, function (avl) {
         assets_category = {
         id: avl.assets_category_id,
         label: avl.assets_category_name
         };
         /!*     $scope.organization = {
         id: avl.organization_id,
         label: avl.organization_name,
         //       organization_type: avl.organization_type
         };
         if (_.findWhere($scope.organizations, $scope.organization) == null) {
         $scope.organizations.push($scope.organization);
         }*!/
         if (_.findWhere($scope.assets_categories, assets_category) == null) {
         $scope.assets_categories.push(assets_category);
         }
         });*/

        if ($scope.selectedOrganizations.length > 0) {
            angular.forEach($scope.markers, function (marker) {
                marker.setMap(null);
            })
            $scope.markers = [];
            //     angular.forEach($scope.selectedOrganizations, function (selected) {
            var percent = 2;
            angular.forEach($scope.avls, function (avl) {
                $scope.progressbar.set(percent++);
                //       if (avl.organization_id === selected.id) {
                //    angular.forEach($scope.selectedAssets, function (selected_asset) {
                //    if (avl.assets_category_id === selected_asset.id) {
                /*PERSON ASSETS*/
                if (avl.assets_category_id == 9 ||
                    avl.assets_category_id == 10) {
                    var iwContent = avl.assetsperson_firstname + ' ' + avl.assetsperson_firstname;
                    var marker = new google.maps.Marker({
                        other: avl,
                        avl_id: avl.avl_id,
                        title: avl.assets_category_name,
                        icon: personIcon,
                        position: new google.maps.LatLng(avl.lat, avl.lng),
                        map: $scope.map,
                    });
                    marker.addListener('click', function () {
                        infowindow.setContent(iwContent);
                        infowindow.open(marker.map, marker);
                    });
                    //    avl.marker = marker;
                    $scope.markers.push(marker);
                }
                /*VEHICLE ASSETS*/
                if (avl.assets_category_id == 11 || avl.assets_category_id == 12 || avl.assets_category_id == 13) {
                    var iwContent = avl.assetsvehicle_plate + ' ' + avl.assetsvehicle_model;
                    var marker = new google.maps.Marker({
                        other: avl,
                        avl_id: avl.avl_id,
                        title: avl.assets_category_name,
                        icon: busIcon,
                        position: new google.maps.LatLng(avl.lat, avl.lng),
                        map: $scope.map,
                    });
                    marker.addListener('click', function () {
                        infowindow.setContent(iwContent);
                        infowindow.open(marker.map, marker);
                    });
                    //     avl.marker = marker;
                    $scope.markers.push(marker);
                }
                //s     }
            })
            //     }
            //     })
            //     });
        }
        else {
            $scope.avl_tracks = [];
        }
    }

    $scope.filterAvls = function () {
        if ($scope.selectedOrganizations.length > 0) {
            angular.forEach($scope.markers, function (marker) {
                marker.setMap(null);
            })
            $scope.markers = [];
            angular.forEach($scope.selectedOrganizations, function (selected) {
                angular.forEach($scope.avls, function (avl) {
                    //       if (avl.organization_id === selected.id) {
                    angular.forEach($scope.selectedAssets, function (selected_asset) {
                        if (avl.assets_category_id === selected_asset.id) {
                            /*PERSON ASSETS*/
                            if (avl.assetsperson_firstname != undefined) {
                                var iwContent = avl.assetsperson_firstname + ' ' + avl.assetsperson_firstname;
                                var marker = new google.maps.Marker({
                                    other: avl,
                                    avl_id: avl.avl_id,
                                    title: avl.assets_category_name,
                                    icon: personIcon,
                                    position: new google.maps.LatLng(avl.lat, avl.lng),
                                    map: $scope.map,
                                });
                                marker.addListener('click', function () {
                                    infowindow.setContent(iwContent);
                                    infowindow.open(marker.map, marker);
                                });
                                //    avl.marker = marker;
                                $scope.markers.push(marker);
                            }
                            /*VEHICLE ASSETS*/
                            if (avl.assetsvehicle_plate != undefined) {
                                var iwContent = avl.assetsvehicle_plate + ' ' + avl.assetsvehicle_model;
                                var marker = new google.maps.Marker({
                                    other: avl,
                                    avl_id: avl.avl_id,
                                    title: avl.assets_category_name,
                                    icon: busIcon,
                                    position: new google.maps.LatLng(avl.lat, avl.lng),
                                    map: $scope.map,
                                });
                                marker.addListener('click', function () {
                                    infowindow.setContent(iwContent);
                                    infowindow.open(marker.map, marker);
                                });
                                //     avl.marker = marker;
                                $scope.markers.push(marker);
                            }
                        }
                    })
                    //     }
                })
            });
        }
        else {
            $scope.avl_tracks = [];
        }
    };

    $scope.showPointDetail = function (e, avl) {
        $scope.avl = avl;
        $scope.map.showInfoWindow('foo-iw', avl.avl_id);
    };
    $scope.hidePointDetail = function (e, avl) {
        $scope.avl = avl;
        $scope.map.showInfoWindow('foo-iw', avl.avl_id);
    };
    /*    $scope.map_styles = [];
     $http.get('assets/map-styles/ng-map-styles.json')
     .then(function (response) {
     $scope.map_styles = response.data.styles;
     });

     $http.get('app/assets/img/iconset-all_maki_icons.json')
     .then(function (response) {
     $scope.icons = response.data;
     });*/
    $scope.showAssetDetail = function (e, avl) {

    }
    $scope.showPanel = function (e, av) {
    }
    $scope.placeMarker = function (e) {
        $scope.marker = new google.maps.Marker({
            position: e.latLng,
            map: $scope.map
        });
        // center point to map
        //   $scope.map.panTo(e.latLng);
        $scope.addPoint();
        $scope.$apply();
    }
    /*
     * Get Assets Types
     *
     */
    /*
     * Search in avls
     */
    $scope.search = function (per_page) {
        AvlService.search($scope.query, per_page.id).then(function (data) {
            $scope.avls = data;
            $scope.pagination = $scope.avls.metadata;
            $scope.maxSize = 5;
        });
    };
// Get list of selected avl to do actions
    $scope.toggleSelection = function toggleSelection(avlId) {
        // toggle selection for a given avl by Id
        var idx = $scope.selection.indexOf(avlId);
        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
        }
        // is newly selected
        else {
            $scope.selection.push(avlId);
        }
    };
    /**********************************************************
     * Event Listener
     **********************************************************/
    $scope.$on('$viewContentLoaded', function () {
        //call it here
    });
    $scope.$on('avl.show', function () {
        Notification({
            message: 'avl.form.showSuccess',
            templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
        }, 'success');
    });
    var default_icon = {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 7.5,
        //    fillColor: randomColor,
        fillOpacity: 0.8,
        strokeWeight: 2.5,
        strokeColor: '#033745',
        scaledSize: new google.maps.Size(57, 55),
    };
})
