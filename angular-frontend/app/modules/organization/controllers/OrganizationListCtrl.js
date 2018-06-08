"use strict";

var app = angular.module('ng-laravel', ['ui.bootstrap', 'angular-ladda']);
app.controller('OrganizationListCtrl', function ($timeout, $scope, $rootScope, OrganizationService, SubOrganizationService, SweetAlert, Notification, $translatePartialLoader, trans) {

    /**********************************************************
     * COMMON TO ALL MODULES
     **********************************************************/
    //  $scope.sortType = 'name'; // set the default sort type
    //  $scope.sortReverse = false;  // set the default sort order
    $scope.searchItem = '';     // set the default search/filter term

    /*
     * Pagination organization list
     */

    /**********************************************************
     * Event Listener
     **********************************************************/
    // Get list of selected organization to do actions
    $scope.selection = [];
    $scope.toggleSelection = function toggleSelection(organizationId) {
        // toggle selection for a given organization by Id
        var idx = $scope.selection.indexOf(organizationId);
        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
        }
        // is newly selected
        else {
            $scope.selection.push(organizationId);
        }
    };

    // update list when organization deleted
    // Update organization event listener
    $scope.$on('organization.update', function () {
        SweetAlert.swal($rootScope.recordUpdated);//define in AdminCtrl
        $scope.isDisabled = false;
        initialize();
    });

    $scope.$on('organization.validationError', function (event, errorData) {
        Notification({
            message: errorData,
            templateUrl: 'app/vendors/angular-ui-notification/tpl/validation.tpl.html'
        }, 'warning');
        $scope.isDisabled = false;
    });


    // update list when organization deleted
    $scope.$on('organization.delete', function () {
        SweetAlert.swal($rootScope.recordDeleted);//define in AdminCtrl
        initialize();

    });

    // update list when organization not deleted
    $scope.$on('organization.not.delete', function () {
        SweetAlert.swal($rootScope.recordNotDeleted);//define in AdminCtrl
        initialize();
    });


    $scope.selectedItem;
    $scope.dropboxpartners = function (organization) {
        SubOrganizationService.show(organization.id).then(function (data) {
            $scope.partners = data;
            $scope.selectedItem = data;
        });
    }

    /**********************************************************
     * COMMON TO ALL MODULES
     **********************************************************/


    /*
     * Search in organizations
     */
    $scope.query = '';
    $scope.search = function (query, per_page) {
        OrganizationService.search(query, per_page.id).then(function (data) {
            $scope.organizations = data;
            $scope.pagination = $scope.organizations.metadata;
            $scope.maxSize = 15;
        });
    };

    $scope.units = [
        {'id': 10, 'label': '10'},
        {'id': 15, 'label': '15'},
        {'id': 20, 'label': '20'},
        {'id': 30, 'label': '30'},
    ]
    $scope.perPage = $scope.units[0];
    $scope.pageChanged = function (per_page) {
        OrganizationService.pageChange($scope.pagination.current_page, per_page.id).then(function (data) {
            $scope.organizations = data;
            $scope.pagination = $scope.organizations.metadata;
            $scope.maxSize = 15;
        });
    };
    /*
     * Get all Organizations
     */
    function initialize() {
        $scope.organizations = [];
        OrganizationService.list().then(function (data) {
            $scope.organization = {};
            $scope.organizations = data;
            $scope.pagination = $scope.organizations.metadata;
            $scope.maxSize = 15;
        });
    }

    initialize();

    /*
     * Get all Organizations
     */
    SubOrganizationService.list().then(function (data) {
        $scope.partners = data;
    });


    $scope.sub_organizations = [];
    $scope.toggleSubOrganizations = function () {
        $scope.day = $scope.sub_organizations.length > 0 ? [] : sub_organizations;
    }
    /*
     * Remove selected organizations
     */
    $scope.activate = function (organization) {
        $scope.isDisabled = true;
        OrganizationService.activate(organization);
        SweetAlert.swal($rootScope.recordUpdated);
    };


    /*
     * Remove selected organizations
     */
    $scope.delete = function (organization) {
        SweetAlert.swal($rootScope.areYouSureDelete,
            function (isConfirm) {
                if (isConfirm) {
                    OrganizationService.delete(organization);
                    SweetAlert.swal($rootScope.recordDeleted);
                }
            });
    };


});

