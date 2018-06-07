"use strict";

var app = angular.module('ng-laravel', ['ui.bootstrap', 'angular.filter']);
app.controller('AssetsGroupListCtrl', function ($scope, $rootScope, AssetsGroupService, AssetsGroupDetailsService, WatcherGroupService, SweetAlert, $translatePartialLoader, trans) {

    $scope.sortType = 'name'; // set the default sort type
    $scope.sortReverse = false;  // set the default sort order
    $scope.searchItem = '';     // set the default search/filter term

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
        AssetsGroupService.pageChange($scope.pagination.current_page, per_page.id).then(function (data) {
            $scope.assetsgroups = data;
            $scope.pagination = $scope.assetsgroups.metadata;
            $scope.maxSize = 10;
        });
    };
    $scope.assetsvehicles = [];
    $scope.assetsresources = [];
    $scope.assetswatchers = [];
    AssetsGroupService.list().then(function (data) {
        $scope.assetsgroups = data;
        WatcherGroupService.list().then(function (data) {
            $scope.assetswatchers = data;
        }).then(function () {
            AssetsGroupDetailsService.list().then(function (data) {
                $scope.assetsdetails = data;
            }).then(function () {
                angular.forEach($scope.assetsgroups, function (group) {
                    group.persons = [];
                    group.watchers = [];
                    angular.forEach($scope.assetsdetails, function (detail) {
                        if (group.assets_group_id == detail.assets_group_id) {
                            group.persons.push(detail);
                        }
                    });
                    angular.forEach($scope.assetswatchers, function (watcher) {
                        if (group.assets_group_id == watcher.assets_group_id) {
                            group.watchers.push(watcher);
                        }
                    });
                })
            }).then(function () {
                $scope.pagination = $scope.assetsgroups.metadata;
                $scope.maxSize = 5;
            })
        })
    });


    /*
     * Search in assetsgroups
     */
    $scope.search = function (per_page) {
        AssetsGroupService.search($scope.query, per_page.id).then(function (data) {
            $scope.assetsgroups = data;
            $scope.pagination = $scope.assetsgroups.metadata;
            $scope.maxSize = 10;
        });
    };


    /* if (_.findWhere($scope.organizations, $scope.organization) == null) {
     $scope.organizations.push($scope.organization);
     }*/


    /*

     /*
     * Define initial value
     */
    $scope.query = '';

    $scope.delete = function (id) {
        SweetAlert.swal($rootScope.areYouSureDelete,
            function (isConfirm) {
                if (isConfirm) {
                    AssetsGroupService.delete(id);
                    SweetAlert.swal($rootScope.recordDeleted);
                }
            });
    };


    /**********************************************************
     * Event Listener
     **********************************************************/
    // Get list of selected assetsgroup to do actions
    $scope.selection = [];
    $scope.toggleSelection = function toggleSelection(assetsgroupId) {
        // toggle selection for a given assetsgroup by Id
        var idx = $scope.selection.indexOf(assetsgroupId);
        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
        }
        // is newly selected
        else {
            $scope.selection.push(assetsgroupId);
        }
    };

    // update list when assetsgroup deleted
    $scope.$on('assetsgroup.delete', function () {
        AssetsGroupService.list().then(function (data) {
            $scope.assetsgroups = data;
            $scope.selection = [];
        });
    });

});


/*
 (function () {
 'use strict';

 angular
 .module('demoApp', ['ng-duallist']).controller('demoController', demoController);

 demoController.$inject = ['$rootScope', '$filter'];

 /!* @ngInject *!/
 function demoController($rootScope, $filter) {
 var $scope = this;
 $scope.property = 'demoController';

 activate();

 ////////////////

 function activate() {
 $scope.leftValue = [];
 var leftcounter = 0;
 $scope.rightValue = [];
 var rightcounter = 0;
 $scope.addValue = [];
 $scope.removeValue = [];

 function loadMoreLeft() {
 for (var i = 0; i < 15; i++) {
 $scope.leftValue.push({
 'name': 'left' + leftcounter
 });
 leftcounter += 10;
 }



 }
 function loadMoreRight() {
 for (var i = 0; i < 15; i++) {
 $scope.rightValue.push({
 'name': 'right' + rightcounter
 });
 rightcounter += 10;
 }


 }

 $scope.options = {
 leftContainerScrollEnd: function () {
 loadMoreLeft()


 },
 rightContainerScrollEnd: function () {
 loadMoreRight();

 },
 leftContainerSearch: function (text) {
 console.log(text)
 $scope.leftValue = $filter('filter')(leftValue, {
 'name': text
 })

 },
 rightContainerSearch: function (text) {

 $scope.rightValue = $filter('filter')(rightValue, {
 'name': text
 })
 },
 leftContainerLabel: 'Available Lists',
 rightContainerLabel: 'Selected Lists',
 onMoveRight: function () {
 console.log('right');
 console.log($scope.addValue);

 },
 onMoveLeft: function () {
 console.log('left');
 console.log($scope.removeValue);
 }

 };
 console.log($scope.options)
 loadMoreLeft();
 loadMoreRight();


 var leftValue = angular.copy($scope.leftValue)

 var rightValue = angular.copy($scope.rightValue)

 }
 }
 })();*/
