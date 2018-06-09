"use strict";


var app = angular.module('ng-laravel', ['ngMap'], ['ui.bootstrap']);  //'btorfs.multiselect'
app.controller('OrganizationCreateCtrl', function ($scope, $http, $q,$rootScope, OrganizationService, $translatePartialLoader, NgMap, Notification, trans) {

    $scope.previousState = $rootScope.previousState;

    /*
     * Define initial value
     */
    $scope.organization = {};
    $scope.place = {};
    $scope.types = "['establishment']";



    /*NG-MAP*/
    $scope.placeChanged = function () {
        $scope.place = this.getPlace();
        var building = $scope.place.address_components[0].long_name;
        $scope.organization.website = $scope.place.website;
        $scope.organization.name = $scope.place.name;
        $scope.organization.city = $scope.place.address_components[2].long_name;
        $scope.organization.street = $scope.place.address_components[1].long_name + ' ' + $scope.place.address_components[0].long_name;
     //   $scope.organization.address = $scope.place.name + " " + building;
        $scope.organization.phone = $scope.place.international_phone_number;
        $scope.organization.description = $scope.place.reviews[0].text;
        $scope.organization.website = $scope.place.website;
        $scope.organization.avatar_url = $scope.place.icon;
        $scope.organization.type = $scope.place.types[0];
        $scope.organization.lat = $scope.place.geometry.location.lat();
        $scope.organization.lng = $scope.place.geometry.location.lng();
    }

    NgMap.getMap().then(function (map) {
        $scope.map = map;
    });


    /*
     * Create a Organization
     */
    $scope.create = function () {
        $scope.isDisabled = true;
        OrganizationService.create($scope.organization);
        $scope.place = {};
    };


    /********************************************************
     * Event Listeners
     * Organization event listener related to OrganizationCreateCtrl
     ********************************************************/
// Create organization event listener
    $scope.$on('organization.create', function () {
        $scope.organization = {};
        Notification({
            message: 'app.shared.alert.created_successfully',
            templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
        }, 'success');
        $scope.isDisabled = false;
    });

//Validation error in create organization event listener
    $scope.$on('organization.validationError', function (event, errorData) {
        Notification({
            message: errorData,
            templateUrl: 'app/vendors/angular-ui-notification/tpl/validation.tpl.html'
        }, 'warning');
        $scope.isDisabled = false;
    });


});