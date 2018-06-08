"use strict";

var app = angular.module('ng-laravel', ['oitozero.ngSweetAlert', 'ngMap', 'dropzone', 'ui.bootstrap', 'sc.select', 'ui.bootstrap']);
app.controller('AssetsPersonCreateCtrl', function ($scope, $rootScope, PointService, AssetsPersonService, AssetsResourceService, OrganizationService, AssetsCategoryService, $translatePartialLoader, NgMap, Notification, trans) {

    $scope.previousState = $rootScope.previousState;

    /*
     * Define initial value
     */
    var category = 'humans';
    var type = 'humans_devices';
    $scope.map = '';
    NgMap.getMap().then(function (map) {
        $scope.map = map;
    });
    $scope.birthday = '';
    $scope.birthmonth = '';
    $scope.birthyear = '';
    $scope.assetsperson = {};
    $scope.assetsperson.avatar_url = '';
    $scope.location = {country: 'co'};
    $scope.type = "['geocode']";
    $scope.sortType = 'name'; // set the default sort type
    $scope.sortReverse = false;  // set the default sort order
    $scope.searchItem = '';     // set the default search/filter term
    $scope.searchItem = $scope.assetsperson.default_point_of_interest;

    /*
     * Define initial value
     */
    $scope.assetsperson.selected_resources = [];
    $scope.assetsperson.organization_id = [];
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
    $scope.organization_settings = {
        enableSearch: true,
        scrollableHeight: '300px',
        scrollable: true,
        selectionLimit: 1,
        groupByTextProvider: function (groupValue) {
            return groupValue;
        },
        smartButtonMaxItems: 1,
        smartButtonTextConverter: function (itemText, originalItem) {
            return itemText;
        }
    };
    $scope.itemArray = [
        {id: 1, name: 'first'},
        {id: 2, name: 'second'},
        {id: 3, name: 'third'},
        {id: 4, name: 'fourth'},
        {id: 5, name: 'fifth'},
    ];
    $scope.selected = {value: $scope.itemArray[0]};
    /*Get list of AssetsResources*/

    /*NG-MAP*/
    $scope.types = "['establishment']";
    $scope.placeChanged = function () {
        $scope.place = this.getPlace();
    }

    PointService.list().then(function (data) {
        $scope.points_of_int = data;
    });
    $scope.showPointDetail = function (e, point) {
        $scope.point = point;
        $scope.map.showInfoWindow('foo-iw', point.id);
        //       $scope.map.panTo(e.latLng);
    };

    /*Get list of Organizations*/
    OrganizationService.list().then(function (response) {
        $scope.organizations = [];
        angular.forEach(response, function (data) {
            $scope.organizations.push(data);
        })
    });

    $scope.onSelectOrganization = function ($item, $model, $label) {
        $scope.assetsperson.organization_id = $model.id;
        var type = 'humans_devices';
        AssetsResourceService.only_free_list(true, type, $model.id).then(function (response) {
            $scope.free_resources = [];
            $scope.assetsperson.selected_resources = [];
            angular.forEach(response, function (free) {
                $scope.free_resources.push({
                    id: free.assets_resource_id,
                    label: 'IMEI: ' + free.imei + ' S/N: ' + free.serial,
                    category: free.assets_category_name
                });
            });
        });
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
    AssetsCategoryService.list(category).then(function (data) {
        $scope.assetscategories = data;
    });
    $scope.create = function (assetsperson) {
        $scope.isDisabled = true;
        if (assetsperson.address === '') {
            $scope.assetsperson.address = $scope.place.name;
        }
        $scope.assetsperson.birthdate = $scope.birthday + "-" + $scope.birthmonth + "-" + $scope.birthyear;
        AssetsPersonService.create(assetsperson);
    };
    /********************************************************
     * Event Listeners
     * AssetsPerson event listener related to AssetsPersonCreateCtrl
     ********************************************************/
// Create assetsperson event listener
    $scope.$on('assetsperson.create', function () {
        $scope.assetsperson = {};
        $scope.free_resources = [];
        Notification({
            message: 'app.shared.alert.created_successfully',
            templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
        }, 'success');
        $scope.isDisabled = false;
    });

//Validation error in create assetsperson event listener
    $scope.$on('assetsperson.validationError', function (event, errorData) {
        Notification({
            message: errorData,
            templateUrl: 'app/vendors/angular-ui-notification/tpl/validation.tpl.html'
        }, 'warning');
        $scope.isDisabled = false;
    });

})


