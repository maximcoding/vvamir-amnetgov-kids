"use strict";

var app = angular.module('ng-laravel', ['ui.bootstrap', 'angular-ladda']);
app.controller('AssetsCategoryListCtrl', function ($scope, AssetsCategoryService, $rootScope, SweetAlert, $translatePartialLoader, trans) {

    /**********************************************************
     * COMMON TO ALL MODULES
     **********************************************************/
    $scope.sortType = 'name'; // set the default sort type
    $scope.sortReverse = false;  // set the default sort order
    $scope.searchItem = '';     // set the default search/filter term

    /*
     * Pagination assetscategory list
     */
    $scope.units = [
        {'id': 10, 'label': '10'},
        {'id': 15, 'label': '15'},
        {'id': 20, 'label': '20'},
        {'id': 30, 'label': '30'},
    ]
    /*
     * Pagination assetscategory list
     */


    

    /*
     * Get all AssetsCategories
     */
    $scope.perPage = $scope.units[0];
    AssetsCategoryService.list().then(function (data) {
        $scope.assetscategories = data;
        $scope.pagination = $scope.assetscategories.metadata;
        $scope.maxSize = 5;
    });


    /*
     * Remove selected assetscategories
     */
    $scope.delete = function (category) {
        SweetAlert.swal($rootScope.areYouSureDelete,
            function (isConfirm) {
                if (isConfirm) {
                    SweetAlert.swal($rootScope.recordDeleted);
                    AssetsCategoryService.delete(category);
                }
            });
    };


    /*
     * Search in assetscategorys
     */
    $scope.search = function (per_page) {
        AssetsCategoryService.search($scope.query, per_page.id).then(function (data) {
            $scope.assetscategories = data;
            $scope.pagination = $scope.assetscategories.metadata;
            $scope.maxSize = 5;
        });
    };


    /**********************************************************
     * Event Listener
     **********************************************************/
    // Get list of selected assetscategory to do actions
    $scope.selection = [];
    $scope.toggleSelection = function toggleSelection(assetscategoryId) {
        // toggle selection for a given assetscategory by Id
        var idx = $scope.selection.indexOf(assetscategoryId);
        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
        }
        // is newly selected
        else {
            $scope.selection.push(assetscategoryId);
        }
    };

    // update list when assetscategory deleted
    $scope.$on('assetscategory.delete', function () {
        AssetsCategoryService.list().then(function (data) {
            $scope.assetscategories = data;
            $scope.selection = [];
        });
    });


});
