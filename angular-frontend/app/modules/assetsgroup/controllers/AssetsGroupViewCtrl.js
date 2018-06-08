"use strict";

angular.module('ng-laravel').controller('AssetsGroupViewCtrl', function ($scope,
                                                $stateParams,
                                                Notification,
                                                AssetsGroupService,
                                                UserService,
                                                AssetsPersonService,
                                                OrganizationService,
                                                WatcherGroupService,
                                                AssetsGroupDetailsService,
                                                $rootScope,
                                                $translatePartialLoader, trans) {

    $scope.previousState = $rootScope.previousState;


    var lastIndex = 3;
    var organization_id = '';
    $scope.details_result = [];
    $scope.assets_group_name = '';
    $scope.selected_organization = '';
    $scope.assets_group_details = [];
    $scope.selected_assets_persons = [];
    $scope.updated_watchers = [];
    $scope.group = {};


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
    }
    AssetsGroupService.show($stateParams.id).then(function (group) {
        $scope.group = group;
        //INIT GROUP NAME FOR EACH KIDS
        $scope.returned_id = '';
        /*INIT GROUP NAME*/
        $scope.assets_group_name = group.name;
        /*INIT GROUP ID*/
        $scope.returned_id = group.id;
        /*INIT ORGANIZATION NAME*/
        OrganizationService.show(group.organization_id).then(function (response) {
            $scope.queryOrganization = response.name;
            $scope.organizations.push(response);
            $scope.selected_organization = response;
            $scope.selected_organization.id = response.id;
            organization_id = response.id;
        }).then(function () {
            // STEP - 1 INIT PERSONS KIDS
            AssetsPersonService.list($scope.selected_organization.id).then(function (data) {
                $scope.assets_persons = [];
                angular.forEach(data, function (person) {
                    if ($scope.selected_organization != '') {
                        $scope.assets_persons.push({
                            persons_organization_id: $scope.selected_organization.id,
                            person_id: Number(person.assets_person_id),
                            full_text: person.firstname + ' ' + person.lastname
                        });
                    }
                });
            }).then(function () {
                AssetsGroupDetailsService.list_by_group_id(group.id).then(function (data) {
                    $scope.details_result = data;
                }).then(function () {
                    angular.forEach($scope.selected_assets_persons, function (object) {
                        object.group_name = group.name;
                    });
                }).then(function () {
                    angular.forEach($scope.details_result, function (detail) {
                        angular.forEach($scope.assets_persons, function (person) {
                            if (detail.assets_person_id == person.person_id) {
                                $scope.selected_assets_persons.push(person);
                            }
                        })
                    })
                });
            }).then(function () {
                // STEP - 2 /*INIT WATCHERS*/
                $scope.watchers = [];
                UserService.list($scope.selected_organization.id).then(function (data) {
                    angular.forEach(data, function (user) {
                        $scope.watchers.push({
                            assets_group_id: '',
                            user_id: user.id,
                            role_name: user.role_name,
                            full_text: user.role_name + '-' + user.firstname + ' ' + user.lastname
                        });
                    });
                }).then(function () {
                    WatcherGroupService.list_by_group_id(group.id).then(function (data) {
                        $scope.watcher_group_by_id = data;
                    }).then(function () {
                        $scope.selected_watchers = [];
                        angular.forEach($scope.watcher_group_by_id, function (watcher_group) {
                            angular.forEach($scope.watchers, function (any_watcher) {
                                if (watcher_group.user_id == any_watcher.user_id) {
                                    $scope.selected_watchers.push(any_watcher);
                                }
                            });
                        });
                    });
                });
            })
        });
    });


    /*
     * Update assetsgroup
     */
    $scope.update = function () {
        $scope.isDisabled = true;
        AssetsGroupService.update({id: $scope.group.id, name: $scope.assets_group_name}).then(function (response) {
            angular.forEach($scope.selected_watchers, function (user) {
                $scope.updated_watchers.push({
                    assets_group_id: $scope.group.id,
                    user_id: user.user_id,
                    full_text: user.full_text
                });
            });
            angular.forEach($scope.selected_assets_persons, function (person) {
                $scope.assets_group_details.push({
                    assets_person_id: Number(person.person_id),
                    assets_group_id: Number($scope.returned_id)
                });
            });
        }).then(function () {
            WatcherGroupService.update($scope.group.id, $scope.updated_watchers, $scope.assets_group_details);
        })
    }


    $scope.settings = {
        //   nonSelectedListLabel: 'Kids outside watch group',
        //   selectedListLabel: 'Selected',
        preserveSelection: 'moved',
        moveOnSelect: true,
        //   filterNonSelected: 'ion ([7-9]|[1][0-2])',
        bootstrap2: false,
        selectMinHeight: 2000,
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
        selectMinHeight: 2000,
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

    /********************************************************
     * Event Listeners
     * AssetsGroup event listener related to AssetsGroupEditCtrl
     ********************************************************/

    // Update assetsgroup event listener
    $scope.$on('assetsgroup.update', function () {
        Notification({
            message: 'app.shared.alert.updated_successfully',
            templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
        }, 'success');
        $scope.isDisabled = false;
    });

    // AssetsGroup form validation event listener
    $scope.$on('assetsgroup.validationError', function (event, errorData) {
        Notification({
            message: errorData,
            templateUrl: 'app/vendors/angular-ui-notification/tpl/validation.tpl.html'
        }, 'warning');
        $scope.isDisabled = false;
    });
});



