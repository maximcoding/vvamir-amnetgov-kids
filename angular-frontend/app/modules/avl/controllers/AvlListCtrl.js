"use strict";

var app = angular.module('ng-laravel', ['ui.bootstrap', 'ngMap', 'sc.select', 'daterangepicker', 'momentjs', 'luegg.directives']);

app.controller('AvlListCtrl', function (JQ_CONFIG, $scope, $cookies, $auth, $localStorage, UserService, AssetsResourceRelationService, AssetsVehicleService, AssetsPersonService, ngProgressFactory, AvlService, $filter, $timeout, $rootScope, $q, $http, AssetsCategoryService, OrganizationService, SweetAlert, NgMap, Notification, $translatePartialLoader, trans) {

    var commands = JQ_CONFIG['COMMANDS'];

    $rootScope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams) {
            clearRouteLines();
            clearMarkers();
        })


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

    $scope.$watch('filterOrganization', function (text_as_event) {
        if (text_as_event.length > 2) {
            $scope.temp_text = text_as_event;
            $timeout.cancel(timer_search_text);
            timer_search_text = $timeout(searchOrg, 1000, true, text_as_event);
        }
        if (text_as_event.length < 1) {
        }
    });
    var now = new Date();
//    var today_formated = now.getUTCFullYear() + "/" + (now.getUTCMonth() + 1) + "/" + now.getUTCDate() + " " + now.getUTCHours() + ":" + now.getUTCMinutes() + ":" + now.getUTCSeconds();
    var now_minus_1 = new Date().setDate(now.getDate() - 1);
    var now_minus_2 = new Date().setDate(now.getDate() - 2);
    var now_minus_7 = new Date().setDate(now.getDate() - 7);
    var yesterday = new Date(now_minus_1);
    var day_before = new Date(now_minus_2);
    var week_ago = new Date(now_minus_7);
    yesterday.setHours(23);
    yesterday.setMinutes(59);
    yesterday.setSeconds(59);
    day_before.setHours(23);
    day_before.setMinutes(59);
    day_before.setSeconds(59);
    $scope.datePicker = {};

    $scope.datePicker.date = {
        startDate: new Date(now_minus_1),
        endDate: new Date()
    };
    //   var yesterday_formated = yesterday.getUTCFullYear() + "/" + (yesterday.getUTCMonth() + 1) + "/" + yesterday.getUTCDate() + " " + yesterday.getUTCHours() + ":" + yesterday.getUTCMinutes() + ":" + yesterday.getUTCSeconds();
    $scope.dateRangeOptions = {
        alwaysShowCalendars: false,
        maxDate: now,
        minDate: new Date().setDate(now.getDate() - 60),
        //  opens: (string: 'left'/'right'/'center')
        //drops (string: 'down' or 'up')
        opens: 'right',
        showDropdowns: true,
        //   showWeekNumbers: true,
        showISOWeekNumbers: true,
        autoUpdateInput: true,
        timePicker: true,
        autoApply: true,
        showCustomRangeLabel: true,
        locale: {
            format: 'MM/DD/YYYY h:mm A'
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
        },
        ranges: {
            'Today': [yesterday, now],
            'Yesterday': [day_before, yesterday],
            'Last Week': [week_ago, now],
            // 'Last 30 Days': [moment().add(-29, 'days'), moment()],
            // 'This month': [moment().startOf('month'), moment()],
            // 'This year': [moment('2016-01-01 00:00:00'), moment()]
        },
        eventHandlers: {
            'apply.daterangepicker': function (evs) {
            }
        }
    };
    $scope.organizationSettings = {
        dynamicTitle: true,
        externalIdProp: '',
        closeOnSelect: false,
        closeOnBlur: true,
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
    $scope.vehicleSettings = {
        dynamicTitle: true,
        externalIdProp: '',
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        checkboxes: true,
        closeOnBlur: true,
        buttonDefaultText: 'Vehicles',
    };
    $scope.personSettings = {
        dynamicTitle: true,
        externalIdProp: '',
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        checkboxes: true,
        closeOnBlur: true,
        buttonDefaultText: 'Persons',
    };
    $scope.map = {};
    $scope.marker = {};
    $scope.markers = [];
    $scope.location = {country: 'co'};
    $scope.type = "['geocode']";
    $scope.customFilter = '';
    $scope.query = '';
    $scope.sortType = 'name'; // set the default sort type
    $scope.sortReverse = false;  // set the default sort order
    $scope.searchItem = '';     // set the default search/filter term*/
    $scope.avl = {};
    $scope.avl.avatar_url = '';
    $scope.filterOrganization = '';
    var organizanion_name = '';
    var timer_search_text;
    var infowindow = new google.maps.InfoWindow();
    var organization_vehicles = [];
    var organization_persons = [];
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
    var personIcon = 'app/assets/img/all_maki_icons-no-bg/person5.svg';
    var busIcon = 'app/assets/img/all_maki_icons-no-bg/bus5.svg';
    var busPulsing = 'app/assets/img/all_maki_icons-no-bg/busOG.svg';
    var busContentImg = 'app/assets/img/all_maki_icons-no-bg/bus_img.png';
    var kidPulsing = 'app/assets/img/all_maki_icons-no-bg/kid-in-bus2.svg';
    var startIcon = 'app/assets/img/icons/start1.svg';
    var endIcon = 'app/assets/img/icons/finish1.svg';
    var turnIcon = 'app/assets/img/icons/circule-red.svg';

    function createMarkerImage(iconUrl, height, width) {
        return new google.maps.MarkerImage(
            iconUrl,
            null, /* size is determined at runtime */
            null, /* origin is 0,0 */
            null, /* anchor is bottom center of the scaled image */
            new google.maps.Size(height, width)
        );
    }

    $scope.clear = function () {
        $scope.selectedOrganization = null;
        $scope.selectedAsset = null;
        $scope.selectedDates = null;
    };
    function getAvlAssetsReports(checked_organization_id) {
        $scope.selectedVehicles = [];
        $scope.selectedPersons = [];
        AssetsVehicleService.list_by_id(checked_organization_id).then(function (response) {
            console.log(response);
            organization_vehicles = response;
            $scope.assets_vehicles = [];
            var assets_vehicle = {};
            angular.forEach(response, function (vehicle) {
                assets_vehicle = {
                    id: vehicle.id,
                    label: vehicle.model + ' : ' + vehicle.plate,
                    category: vehicle.assets_category_name,
                    organization_id: vehicle.organization_name,
                    organization_name: vehicle.organization_id,
                    model: vehicle.model,
                    plate: vehicle.plate,
                    asset_resources: vehicle.vehicle_resources,
                    fuel_type: vehicle.fuel_type,
                    mileage: vehicle.mileage,
                    passenger_cap: vehicle.passenger_cap,
                    assets_category_id: vehicle.assets_category_id,
                    assets_category_name: vehicle.assets_category_name
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
        AssetsPersonService.list_by_id(checked_organization_id.id).then(function (response) {
            organization_persons = response;
            $scope.assets_persons = [];
            var assets_person = {};
            angular.forEach(response, function (person) {
                assets_person = {
                    id: person.assets_person_id,
                    label: person.firstname + ' ' + person.lastname,
                    category: person.assets_category_name,
                    organization_id: person.organization_id,
                    organization_name: person.organization_name,
                    phone: person.phone,
                    firstname: person.firstname,
                    lastname: person.lastname,
                    asset_resources: person.person_resources,
                    assets_category_id: person.assets_category_id,
                    assets_category_name: person.assets_category_name,
                    assets_resouce_id: person.assets_resouce_id,
                    assetsperson_phone: person.assetsperson_phone,
                    card_id: person.card_id,
                    default_point_of_interest: person.default_point_of_interest
                };
                if (person.person_resources.length > 0) {
                    $scope.assets_persons.push(assets_person);
                }
            })
            if ($scope.assets_persons.length == 0) {
                assets_person = {
                    id: 1,
                    label: 'No Reports',
                    category: ''
                };
            }
        });
    }

    $scope.organizationEvents = {
        onItemSelect: function (checked_org) {
            getAvlAssetsReports(checked_org.id);
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
            angular.forEach(organization_vehicles, function (vehicle) {
                if (vehicle.id == checked_vehicle.id) {
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
    $scope.personEvents = {
        onItemSelect: function (checked_person) {
            angular.forEach(organization_persons, function (person) {
                if (person.id == checked_person.id) {
                    $scope.selectedAssets = [];
                    $scope.assets_categories = [];
                    var assets_category = {};
                    if (person.person_resources.length > 0) {
                        angular.forEach(person.person_resources, function (resource) {
                            assets_category = {
                                id: resource.id,
                                label: resource.assets_category_name,
                                category: person.assets_category_name
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
    $scope.checkboxes_params = [
        {
            "id": 1,
            "label": "Trail",
            "selected": 0,
        },
        {
            "id": 2,
            "label": "Real",
            "selected": 1,
        },
        {
            "id": 4,
            "label": 'Track',
            "selected": 0,
        }];
    var switch_value = 0;
    $scope.runQuery = function runQuery() {
        if ($scope.selectedOrganizations === undefined || $scope.selectedOrganizations.length < 1) {
            return;
        }
        if ($scope.selectedVehicles === undefined || ($scope.selectedVehicles.length < 1) &&
            ($scope.selectedPersons === undefined || $scope.selectedPersons.length < 1)) {
            return;
        }
        var promises = [];
        var defer = $q.defer();
        $scope.progressbar = ngProgressFactory.createInstance();
        $scope.progressbar.stop();

        function lastTask() {
            angular.isArray($scope.datePicker.date.startDate._i && $scope.datePicker.date.endDate._i);
            {
                $scope.datePicker.date.startDate._i = $scope.datePicker.date.startDate._d;
                $scope.datePicker.date.endDate._i = $scope.datePicker.date.endDate._d;
            }
            switch (switch_value) {
                case 0: //Last Report as Default
                    AvlService.runQuery(
                        $scope.datePicker.date.startDate._i,
                        $scope.datePicker.date.endDate._i,
                        $scope.selectedOrganizations,
                        $scope.selectedAssets,
                        $scope.selectedVehicles,
                        $scope.selectedPersons,
                        switch_value
                    ).then(function (response) {
                        createMarkers(response.data, false);
                    }).then(function () {
                        defer.resolve();
                    });
                    break;
                case 1: //All Reports Between Dates
                case 3: //All Reports Between Dates
                case 5: //All Reports Between Dates
                case 7: //All Reports Between Dates
                    AvlService.runQuery(
                        $scope.datePicker.date.startDate._i,
                        $scope.datePicker.date.endDate._i,
                        $scope.selectedOrganizations,
                        $scope.selectedAssets,
                        $scope.selectedVehicles,
                        $scope.selectedPersons,
                        switch_value
                    ).then(function (response) {
                        console.log('reports found ->' + response.data.length);
                        createMarkers(response.data, true);
                    }).then(function () {
                        defer.resolve();
                    });
                    break;
                case 2:  //REAL TIME

                    break;
                case 3:
                    break;
                case 4:
                    break;
                case 6:
                    break;
            }
            saveForm();
        }

        angular.forEach($scope.checkboxes_params, function (checkbox) {
            if (checkbox.selected) {
                switch_value = switch_value + checkbox.id;
            }
            promises.push(checkbox);
        })
        $q.all(promises).then(lastTask);
        return defer;
    }

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
    // Adds a marker at the center of the map.
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

    function setMapOnAll(map) {
        for (var i = 0; i < $scope.avl_tracks.length; i++) {
            $scope.avl_tracks[i].setMap(map);
        }
        if ($scope.markers.length > 0) {
            angular.forEach($scope.markers, function (marker) {
                marker.setMap(map);
            })
        }
    }

    function showMarkers() {
        setMapOnAll($scope.map);
    }

    function saveForm() {
        $localStorage.data.avl = {};
        $localStorage.data.avl.organizations = $scope.organizations;
        $localStorage.data.avl.selectedOrganizations = $scope.selectedOrganizations;
        $localStorage.data.avl.assets_categories = $scope.assets_categories;
        $localStorage.data.avl.selectedAssets = $scope.selectedAssets;
        $localStorage.data.avl.assets_vehicles = $scope.assets_vehicles;
        $localStorage.data.avl.selectedVehicles = $scope.selectedVehicles;
        $localStorage.data.avl.assets_persons = $scope.assets_persons;
        $localStorage.data.avl.selectedPersons = $scope.selectedPersons;
    };
    function initialize() {
        NgMap.getMap().then(function (map) {
            $scope.map = map;
        });
        $scope.avls = [];
        $scope.avl_tracks = [];
        $scope.organizations = [];
        $scope.assets_vehicles = [];
        $scope.assets_persons = [];

        $scope.selectedParams = [];
        $scope.selectedVehicles = [];
        $scope.selectedPersons = [];
        $scope.selectedAssets = [];
        $scope.selectedOrganizations = [];
        if ($localStorage.data.avl && $localStorage.data.avl !== undefined) {
            $scope.organizations = $localStorage.data.avl.organizations;
            $scope.assets_vehicles = $localStorage.data.avl.assets_vehicles;
            $scope.assets_persons = $localStorage.data.avl.assets_persons;
            $scope.selectedOrganizations = $localStorage.data.avl.selectedOrganizations;
            $scope.selectedAssets = $localStorage.data.avl.selectedAssets;
            $scope.selectedPersons = $localStorage.data.avl.selectedPersons;
            $scope.selectedVehicles = $localStorage.data.avl.selectedVehicles;
        }
        else {
            $scope.user = $auth.getProfile().$$state.value;
            UserService.show_profile($scope.user.id).then(function (response) {
                if (response[0].role_name !== 'administrators') {
                    OrganizationService.show($scope.user.organization_id).then(function (organization) {
                        searchOrg(organization.name);
                        // fill up dropdowns for vehicles and persons
                        getAvlAssetsReports($scope.user.organization_id);
                        $scope.selectedOrganizations.push({id: $scope.user.organization_id});
                    })
                }
            });
        }
    }

    initialize();


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
                                    icon: createMarkerImage(personIcon, 55, 45),
                                    position: new google.maps.LatLng(avl.lat, avl.lng),
                                    map: $scope.map
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
                                    icon: createMarkerImage(busIcon, 25, 20),
                                    position: new google.maps.LatLng(avl.lat, avl.lng),
                                    map: $scope.map
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
    $scope.$on('avl.empty', function () {
        Notification({
            message: 'No Reports Found',
            templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
        }, 'info');
    });

    $scope.$on('message_income', function (event, message) {
        switch (message.command) {
            case commands['MQTT_AVL_REPORT']:
                clearMarkers();
                var result = '';
                angular.forEach($scope.assets_vehicles, function (vehicle) {
                    result = _.find(vehicle.asset_resources, function (obj) {
                        return obj.assets_resource_id == message.resource_id;
                    })
                    if (result !== undefined) {
                        console.log(result);
                        createEmptyMarker(message, vehicle);
                        return;
                    }
                })
                if (result === undefined) {
                    angular.forEach($scope.assets_persons, function (person) {
                        result = _.find(person.asset_resources, function (obj) {
                            return obj.assets_resource_id == message.resource_id;
                        })
                        if (result !== undefined) {
                            createEmptyMarker(message, person);
                            return;
                        }
                    });
                }
                break;
            default:
                break;
        }

    });

    $scope.$on('connection:opened', function (event, data) {
    });

    $scope.$on('connection:lost', function (event, data) {
    });

    $scope.$on('connection:error', function (event, data) {
    });


// $scope.$on('organizations.empty', function (event, data) {
//     Notification({
//         message: 'At least 1 Organizations must be selected',
//         templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
//     }, 'warning');
// });
// $scope.$on('assets.empty', function (event, data) {
//     Notification({
//         message: 'At least 1 Vehicle or Person must be selected',
//         templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
//     }, 'warning');
// });

    // var goldStar = {
    //     path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
    //     fillColor: 'yellow',
    //     fillOpacity: 0.8,
    //     scale: 1,
    //     strokeColor: 'gold',
    //     strokeWeight: 11
    // };

    var cached_markers = [];

    function createEmptyMarker(report, asset) {
        // must use optimized false for CSS
        var marker = new google.maps.Marker({optimized: false, map: $scope.map});
        createOverLayView();
        switch (asset.assets_category_id) {
            case 2:
            case 9:   //BUS MARKER
            case 10:
                marker.setIcon(createMarkerImage(busPulsing, 55, 45));
                break;
            case 11: //PERSON MARKER
            case 12:
            case 13:
            case 4:
            case 5:
                //    marker.setIcon(goldStar);
                marker.setIcon(createMarkerImage(kidPulsing, 65, 55));
                break;
        }
        //PERSON MARKER
        marker.setTitle(asset.model + ' ' + asset.plate);
        marker.set("avl_data", report);
        marker.set("asset_data", asset);
        marker.set("id", report.resource_id);

        marker.setPosition(new google.maps.LatLng(report.lat, report.lng));
        createContentForInfoWindow(report, asset);
        infowindow.setContent(markerContentBus);
        marker.addListener('click', function () {
            infowindow.open($scope.map, marker);
        });
        removePreviousMarkerPosition(report.resource_id, report);
        cached_markers[report.resource_id] = marker; // cache created marker to markers object with id as its key
    }

    function removePreviousMarkerPosition(id) {
        var marker = cached_markers[id]; // find the marker by given id
        if (marker !== undefined) {
            marker.setMap(null);
        }
    }

    var markerContentBus = '';

    function createContentForInfoWindow(report, asset) {
        console.log(asset);
        markerContentBus = '<div><h5 class="panel">' + asset.model + ' ' + asset.plate + '</h5>' +
            '<img class="img-responsive img-circle" src="' + busContentImg + '"/></div>'+
                '<ul class="list-group">' +
            '<li class="list-group-item">' + report.imei +'</li>' +
            '<li class="list-group-item">' + report.distance +'</li>' +
            '<li class="list-group-item">' + report.avl_time +'</li>' +
            '<li class="list-group-item">' + report.heading +'</li>' +
            '<li class="list-group-item">' + report.gsmsignal +'</li>' +
            '<li class="list-group-item">' + report.io +'</li>' +
            '<li class="list-group-item">' + report.temperature +'</li>' +
            '<li class="list-group-item">' + report.rfid_num +'</li>' +
            '<li class="list-group-item">' + report.rfid_tags +'</li>' +
            '<li class="list-group-item">' + report.extvolt +'</li>' +
            '<li class="list-group-item">' + report.extvolt +'</li>' +
            '<li class="list-group-item">' + report.extvolt +'</li>' +
            '</ul>'
        ;
    }


    var default_icon = {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 7.5,
        //    fillColor: randomColor,
        fillOpacity: 0.8,
        strokeWeight: 2.5,
        strokeColor: '#033745',
        scaledSize: new google.maps.Size(57, 55),
    };
    var grouped_data = [];

    function createMarkers(data, routes_flag) {
        angular.forEach($scope.markers, function (response) {
            response.setMap(null);
        })
        $scope.avls = data;
        angular.forEach($scope.markers, function (marker) {
            marker.setMap(null);
        })
        $scope.markers = [];
        var percent = 2;
        if (!routes_flag) {
            angular.forEach($scope.avls, function (avl) {
                $scope.progressbar.set(percent++);
                /*PERSON ASSETS*/
                if (avl.assets_category_id == 9 ||
                    avl.assets_category_id == 10) {
                    //   var iwContent = avl.assetsperson_firstname + ' ' + avl.assetsperson_firstname;
                    // var marker = new google.maps.Marker({
                    //     other: avl,
                    //     avl_id: avl.avl_id,
                    //     title: avl.assets_category_name,
                    //     icon: personIcon,
                    //     position: new google.maps.LatLng(avl.lat, avl.lng),
                    //     map: $scope.map
                    // });
                    createMarker(new google.maps.LatLng(avl.lat, avl.lng), createMarkerImage(personIcon, 42, 38));
                    // marker.addListener('click', function () {
                    //     infowindow.setContent(iwContent);
                    //     infowindow.open(marker.map, marker);
                    // });
                    //    avl.marker = marker;
                    //     $scope.markers.push(marker);
                }
                /*VEHICLE ASSETS*/
                if (avl.assets_category_id == 11 || avl.assets_category_id == 12 || avl.assets_category_id == 13) {
                    //     var iwContent = avl.assetsvehicle_plate + ' ' + avl.assetsvehicle_model;
                    // var marker = new google.maps.Marker({
                    //     other: avl,
                    //     avl_id: avl.avl_id,
                    //     title: avl.assets_category_name,
                    //     icon: busIcon,
                    //     position: new google.maps.LatLng(avl.lat, avl.lng),
                    //     map: $scope.map
                    // });
                    createMarker(new google.maps.LatLng(avl.lat, avl.lng), createMarkerImage(busIcon, 42, 38));
                    // marker.addListener('click', function () {
                    //     infowindow.setContent(iwContent);
                    //     infowindow.open(marker.map, marker);
                    // });
                    //     avl.marker = marker;
                    //      $scope.markers.push(marker);
                }
            })
        }
        else {
            grouped_data = _.groupBy($scope.avls, "avl_resource_id");
            // generateRequests(grouped_data);
            drawPolyLines(grouped_data);
        }
        $scope.progressbar.complete();
    }

    function clearRouteLines() {
        if (polylines.length > 0) {
            angular.forEach(polylines, function (route) {
                route.setMap(null);
            })
        }
    }

    function createOverLayView() {
        var myoverlay = new google.maps.OverlayView();
        myoverlay.draw = function () {
            this.getPanes().markerLayer.id = 'markerLayer';
        };
        myoverlay.setMap($scope.map);
    }

    function drawPolyLines(grouped_avls_by_resource_id) {
        clearMarkers();
        clearRouteLines();
        var count_parts = 0;
        angular.forEach(grouped_avls_by_resource_id, function (resource_reports) {
            var routeCoordanites = [];
            angular.forEach(resource_reports, function (report) {
                routeCoordanites.push(new google.maps.LatLng(report.lat, report.lng));
                // marker on the route as simple report
                createMarker(new google.maps.LatLng(report.lat, report.lng), createMarkerImage(turnIcon, 13, 13));
            })
            var routeLine = new google.maps.Polyline({
                path: routeCoordanites,
                strokeColor: getRandColor(),
                strokeOpacity: 0.7,
                strokeWeight: 8,
                geodesic: true,
                map: $scope.map
            });
            WhilePolylinecomplete(routeLine);
            createOverLayView();
            var last_route = _.last(resource_reports);
            //start route marker
            createMarker(new google.maps.LatLng(resource_reports[0].lat, resource_reports[0].lng), createMarkerImage(startIcon, 42, 38));
            // finish route marker
            createMarker(new google.maps.LatLng(last_route.lat, last_route.lng), createMarkerImage(endIcon, 42, 38));
        })
    }

    var apiKey = 'AIzaSyDW9hD3wx0xleEsVeJd8tewgjPIo5KjM9w';
    var placeIdArray = [];
    var polylines = [];
    var snappedCoordinates = [];
    var count = 0;
// Snap-to-road when the polyline is completed.
    function WhilePolylinecomplete(poly) {
        var path = poly.getPath();
        polylines.push(poly);
        placeIdArray = [];
        runSnapToRoad(path);
    }

// Snap a user-created polyline to roads and draw the snapped path
    function runSnapToRoad(path) {
        var pathValues = [];
        var limit_path = 0;
        for (var i = 0; i < path.getLength(); i++) {
            limit_path++;
            pathValues.push(path.getAt(i).toUrlValue());
            if (limit_path > 98) {
                processRequest(pathValues);
                pathValues = [];
                limit_path = 0;
                pathValues.push(path.getAt(i).toUrlValue());
            }
        }
        processRequest(pathValues);
        pathValues = [];
        limit_path = 0;
    }

    function processRequest(pathValues) {
        $.get('https://roads.googleapis.com/v1/snapToRoads', {
            interpolate: true,
            key: apiKey,
            path: pathValues.join('|')
        }, function (data) {
            pathValues = [];
            processSnapToRoadResponse(data);
            drawSnappedPolyline();
            // getAndDrawSpeedLimits();
        });
    }

// Store snapped polyline returned by the snap-to-road service.
    function processSnapToRoadResponse(data) {
        snappedCoordinates = [];
        placeIdArray = [];
        if (data !== undefined) {
            for (var i = 0; i < data.snappedPoints.length; i++) {
                var latlng = new google.maps.LatLng(
                    data.snappedPoints[i].location.latitude,
                    data.snappedPoints[i].location.longitude);
                snappedCoordinates.push(latlng);
                placeIdArray.push(data.snappedPoints[i].placeId);
            }
        }
    }

// Draws the snapped polyline (after processing snap-to-road response).
    function drawSnappedPolyline() {
        var snappedPolyline = new google.maps.Polyline({
            path: snappedCoordinates,
            strokeColor: 'black',
            strokeWeight: 3
        });
        snappedPolyline.setMap($scope.map);
        polylines.push(snappedPolyline);
    }

// Gets speed limits (for 100 segments at a time) and draws a polyline
// color-coded by speed limit. Must be called after processing snap-to-road
// response.
    function getAndDrawSpeedLimits() {
        for (var i = 0; i <= placeIdArray.length / 100; i++) {
            // Ensure that no query exceeds the max 100 placeID limit.
            var start = i * 100;
            var end = Math.min((i + 1) * 100 - 1, placeIdArray.length);

            drawSpeedLimits(start, end);
        }
    }

// Gets speed limits for a 100-segment path and draws a polyline color-coded by
// speed limit. Must be called after processing snap-to-road response.
    function drawSpeedLimits(start, end) {
        var placeIdQuery = '';
        for (var i = start; i < end; i++) {
            placeIdQuery += '&placeId=' + placeIdArray[i];
        }
        $.get('https://roads.googleapis.com/v1/speedLimits',
            'key=' + apiKey + placeIdQuery,
            function (speedData) {
                processSpeedLimitResponse(speedData, start);
            }
        );
    }

    function processSpeedLimitResponse(speedData, start) {
        var end = start + speedData.speedLimits.length;
        for (var i = 0; i < speedData.speedLimits.length - 1; i++) {
            var speedLimit = speedData.speedLimits[i].speedLimit;
            var color = getColorForSpeed(speedLimit);

            // Take two points for a single-segment polyline.
            var coords = snappedCoordinates.slice(start + i, start + i + 2);

            var snappedPolyline = new google.maps.Polyline({
                path: coords,
                strokeColor: color,
                strokeWeight: 6
            });
            snappedPolyline.setMap(map);
            polylines.push(snappedPolyline);
        }
    }


    function getColorForSpeed(speed_kph) {
        if (speed_kph <= 40) {
            return 'purple';
        }
        if (speed_kph <= 50) {
            return 'blue';
        }
        if (speed_kph <= 60) {
            return 'green';
        }
        if (speed_kph <= 80) {
            return 'yellow';
        }
        if (speed_kph <= 100) {
            return 'orange';
        }
        return 'red';
    }

    function getRandColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }


    function createMarker(LatLng, iconName) {
        var marker = new google.maps.Marker({
            position: LatLng,
            // must use optimized false for CSS
            optimized: false,
            icon: iconName
        });
        addToMap(marker);
        $scope.markers.push(marker);
    }

    function deleteMarker(marker) {
        marker.setMap(null);
    }

    function addToMap(element) {
        element.setMap($scope.map);
    }

// function initializeCetegories() {
//     AssetsCategoryService.list('devices').then(function (response) {
//         $scope.assets_categories = [];
//         var assets_category = {};
//         angular.forEach(response, function (category) {
//             assets_category = {
//                 id: category.id,
//                 label: category.name
//             };
//             $scope.assets_categories.push(assets_category);
//         })
//     })
// }
// //  var directionsService = new google.maps.DirectionsService();
// //  var requestArray = [];
// //  var renderArray = [];
// //   function generateRequests(grouped_data) {
// //       requestArray = [];
// //       angular.forEach(grouped_data, function (route) {
// //           // This now deals with one of the people / routes
// //           // Somewhere to store the wayoints
// //           var route_way_points = [];
// //           // 'start' and 'finish' will be the routes origin and destination
// //           var start_way, end_way;
// //           angular.forEach(route, function (route_avl) {
// //               route_way_points.push({
// //                   location: new google.maps.LatLng(route_avl.lat, route_avl.lng),
// //                   stopover: true
// //               });
// //           });
// //           start_way = route_way_points[0].location;
// //           // Grab the last waypoint for use as a 'finish' location
// //           end_way = _.last(route_way_points);
// //           end_way = end_way.location;
// //
// //           // Let's create the Google Maps request object
// //           var request = {
// //               origin: start_way,
// //               destination: end_way,
// //               waypoints: route_way_points,
// //               travelMode: google.maps.TravelMode.DRIVING
// //           };
// //           // and save it in our requestArray
// //           requestArray.push({"route": route, "request": request});
// //       });
// //
// //       // CLEAN OLD ROUTES BEFORE DISPLAY AGAIN
// //       if (renderArray.length > 0) {
// //           angular.forEach(renderArray, function (direction) {
// //               direction.setMap(null);
// //           })
// //       }
// //
// //       if (requestArray.length > 0) {
// //           processRequests();
// //       }
// //   }
// //   function processRequests() {
// //
// //       // Counter to track request submission and process one at a time;
// //       var i = 0;
// //
// //       // Used to submit the request 'i'
// //       function submitRequest() {
// //           directionsService.route(requestArray[i].request, directionResults);
// //       }
// //
// //       // Used as callback for the above request for current 'i'
// //       function directionResults(result, status) {
// //           if (status == google.maps.DirectionsStatus.OK) {
// //               var randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
// //               // Create a unique DirectionsRenderer 'i'
// //               renderArray[i] = new google.maps.DirectionsRenderer({suppressMarkers: true});
// //               renderArray[i].setMap($scope.map);
// //               map.setZoom(2);
// //               // Some unique options from the colorArray so we can see the routes
// //               renderArray[i].setOptions({
// //                   preserveViewport: true,
// //                   suppressInfoWindows: true,
// //                   polylineOptions: {
// //                       strokeWeight: 4,
// //                       strokeOpacity: 0.8,
// //                       strokeColor: randomColor
// //                   },
// //                   markerOptions: {
// //                       icon: {
// //                           path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
// //                           scale: 3,
// //                           strokeColor: randomColor
// //                       }
// //                   }
// //               });
// //               // Use this new renderer with the result
// //
// //               renderArray[i].setDirections(result);
// //               // and start the next request
// //               nextRequest();
// //           }
// //       }
// //
// //       function nextRequest() {
// //           // Increase the counter
// //           i++;
// //           // Make sure we are still waiting for a request
// //           if (i >= requestArray.length) {
// //               // No more to do
// //               return;
// //           }
// //           // Submit another request
// //           submitRequest();
// //       }
// //
// //       // This request is just to kick start the whole process
// //       submitRequest();
// //   }

});