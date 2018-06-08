"use strict";

var app = angular.module('ng-laravel', ['frapontillo.bootstrap-duallistbox']);

app.controller('AssetsGroupCreateCtrl', function ($scope, WatcherGroupService,$rootScope, AssetsGroupService, AssetsPersonService, Notification, OrganizationService, UserService, $translatePartialLoader, trans) {
    $scope.previousState = $rootScope.previousState;


    var lastIndex = 3;
    $scope.selected_assets_persons = [];
    $scope.selected_watchers = [];
    $scope.assets_group_name = '';
    $scope.selected_organization = '';
    $scope.assets_group_details = [];
    $scope.updated_watchers = [];


    /*Get list of Organizations*/
    /*  OrganizationService.list().then(function (data) {
     $scope.organizations = data;
     $scope.selected_organization = $scope.organizations[0].id;
     });
     */

    $scope.onSelectOrganization = function ($item, $model, $label) {
        $scope.selected_organization = $model;
    };
    $scope.organizations = [];
    $scope.searchOrganization = function (queryOrganization) {
        if (queryOrganization.length > 1) {
            OrganizationService.search(queryOrganization, "50").then(function (response) {
                $scope.organizations = [];
                angular.forEach(response, function (data) {
                    $scope.organizations.push(data);
                })
            });
        }
    }


    // STEP 1
    $scope.save_group_name = function () {
        angular.forEach($scope.selected_assets_persons, function (object) {
            object.group_name = $scope.assets_group_name;
        });
        AssetsPersonService.list($scope.selected_organization.id).then(function (data) {
            $scope.assets_persons = [];
            angular.forEach(data, function (person) {
                if ($scope.selected_organization != '') {
                    $scope.assets_persons.push({
                        persons_organization_id: person.organization_id,
                        person_id: Number(person.assets_person_id),
                        full_text: person.firstname + ' ' + person.lastname
                    });
                }
            });
        });
    }

    // STEP 2
    $scope.load_users_watchers = function () {
        $scope.watchers = [];
        UserService.list($scope.selected_organization.id).then(function (data) {
            angular.forEach(data, function (user) {
                $scope.watchers.push({
                    assets_group_id: '',
                    user_id: user.id,
                    role_name: user.role_name,
                    full_text: user.role_name + '-' + user.firstname + ' ' + user.lastname
                });
            })
        });
    }
    $scope.create_group = function () {
        $scope.returned_id = '';
        AssetsGroupService.create($scope.assets_group_name, $scope.selected_organization.id).then(function (returned_group_id) {
            $scope.returned_id = returned_group_id;
        }).then(function () {
            $scope.updated_watchers = [];
            $scope.assets_group_details = [];
            angular.forEach($scope.selected_watchers, function (user) {
                $scope.updated_watchers.push({
                    assets_group_id: parseInt($scope.returned_id),
                    user_id: parseInt(user.user_id),
                    full_text: user.full_text
                });
            });
            angular.forEach($scope.selected_assets_persons, function (person) {
                $scope.assets_group_details.push({
                    assets_person_id: parseInt(person.person_id),
                    assets_group_id: parseInt($scope.returned_id)
                });
            });
        }).then(function () {
            WatcherGroupService.create($scope.updated_watchers, $scope.assets_group_details);
        })
    }

    $scope.settings = {
        //   nonSelectedListLabel: 'Kids outside watch group',
        //   selectedListLabel: 'Selected',
        preserveSelection: 'moved',
        moveOnSelect: true,
        //   filterNonSelected: 'ion ([7-9]|[1][0-2])',
        bootstrap2: false,
        selectMinHeight: 1000,
        // filterClear: 'Show all!',
        filterPlaceHolder: 'Search Person',
        moveSelectedLabel: 'Move selected only',
        moveAllLabel: 'Move all Persons to group',
        removeSelectedLabel: 'Remove selected only',
        removeAllLabel: 'Remove all Persons from group',
        postfix: '_helperz',
        filter: true,
        //    filterSelected: '4',
        infoAll: '<label class="text text-success">{0} Persons</label>',
        infoFiltered: '<label class="label label-danger">Filtered</label> {0} from {1}!',
        infoEmpty: '<label class="label label-danger text-center">Empty group</label>',
        filterValues: true
    };
    $scope.settings2 = {
        //   nonSelectedListLabel: 'Kids outside watch group',
        //   selectedListLabel: 'Selected',
        preserveSelection: 'moved',
        moveOnSelect: true,
        //   filterNonSelected: 'ion ([7-9]|[1][0-2])',
        bootstrap2: false,
        selectMinHeight: 1000,
        // filterClear: 'Show all!',
        filterPlaceHolder: 'Search User',
        moveSelectedLabel: 'Move selected only',
        moveAllLabel: 'Move all Users to watchers group',
        removeSelectedLabel: 'Remove selected only',
        removeAllLabel: 'Remove all Users from watchers group',
        postfix: '_helperz',
        filter: true,
        //    filterSelected: '4',
        infoAll: '<label class="text text-success">{0} Users</label>',
        infoFiltered: '<label class="label label-danger">Filtered</label> {0} from {1}!',
        infoEmpty: '<label class="label label-danger text-center">Empty watchers group</label>',
        filterValues: true
    };
    $scope.stepsOptions2 = {
        headerTag: "h3",
        bodyTag: "section",
        transitionEffect: "slideLeft",
        stepsOrientation: "vertical"
    }


    /*Get list of AssetsResources*/
    $scope.changeme = function () {
        $scope.resources = [];
        AssetsResourceService.list().then(function (resources) {
            angular.forEach(resources, function (resource) {
                if (resource.organization_id == $scope.selected_assets_persons.organization_id) {
                    $scope.resources.push(resource);
                }
            })
        });

    }


    /********************************************************
     * Event Listeners
     * AssetsGroup event listener related to AssetsGroupCreateCtrl
     ********************************************************/
    // Create assetsgroup event listener
    $scope.$on('assetsgroup.create', function () {
        Notification({
            message: 'app.shared.alert.created_successfully',
            templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
        }, 'success');
        $scope.isDisabled = false;
    });

    //Validation error in create groupwatcher event listener
    $scope.$on('assetsgroup.validationError', function (event, errorData) {
        Notification({
            message: errorData,
            templateUrl: 'app/vendors/angular-ui-notification/tpl/validation.tpl.html'
        }, 'warning');
        $scope.isDisabled = false;
    });

});


