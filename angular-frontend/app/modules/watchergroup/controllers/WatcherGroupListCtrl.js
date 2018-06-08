"use strict";

var app = angular.module('ng-laravel', ['ui.bootstrap']);
app.controller('WatcherGroupListCtrl', function ($scope, WatcherGroupService, $rootScope, SweetAlert, $translatePartialLoader, trans) {

    $scope.table_options = {
        paging: false,
        select: true,
        autoWidth: true,
        responsive: true,
        ordering: true,
        searching: false,
        info: false
    };
    /*
     * Define initial value
     */
    $scope.query = '';


    /*
     * Get all WatcherGroups
     */
    WatcherGroupService.list().then(function (data) {
        $scope.groupwatchers = data;
        $scope.pagination = $scope.groupwatchers.metadata;
        $scope.maxSize = 5;
    });


    /*
     * Remove selected groupwatchers
     */
    $scope.delete = function (category) {
        SweetAlert.swal($rootScope.areYouSureDelete,
            function (isConfirm) {
                if (isConfirm) {
                    SweetAlert.swal($rootScope.recordDeleted);
                    WatcherGroupService.delete(category);
                }
            });
    };


    /*
     * Pagination groupwatcher list
     */
    $scope.units = [
        {'id': 10, 'label': 'Show 10 Item Per Page'},
        {'id': 15, 'label': 'Show 15 Item Per Page'},
        {'id': 20, 'label': 'Show 20 Item Per Page'},
        {'id': 30, 'label': 'Show 30 Item Per Page'},
    ]
    $scope.perPage = $scope.units[0];
    $scope.pageChanged = function (per_page) {
        WatcherGroupService.pageChange($scope.pagination.current_page, per_page.id).then(function (data) {
            $scope.groupwatchers = data;
            $scope.pagination = $scope.groupwatchers.metadata;
            $scope.maxSize = 5;
        });
    };


    /*
     * Search in groupwatchers
     */
    $scope.search = function (per_page) {
        WatcherGroupService.search($scope.query, per_page.id).then(function (data) {
            $scope.groupwatchers = data;
            $scope.pagination = $scope.groupwatchers.metadata;
            $scope.maxSize = 5;
        });
    };


    /**********************************************************
     * Event Listener
     **********************************************************/
    // Get list of selected groupwatcher to do actions
    $scope.selection = [];
    $scope.toggleSelection = function toggleSelection(groupwatcherId) {
        // toggle selection for a given groupwatcher by Id
        var idx = $scope.selection.indexOf(groupwatcherId);
        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
        }
        // is newly selected
        else {
            $scope.selection.push(groupwatcherId);
        }
    };

    // update list when groupwatcher deleted
    $scope.$on('groupwatcher.delete', function () {
        WatcherGroupService.list().then(function (data) {
            $scope.groupwatchers = data;
            $scope.selection = [];
        });
    });


});
