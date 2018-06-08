"use strict";

var app = angular.module('ng-laravel',['ui.bootstrap']);
app.controller('AssetsGroupDetailsListCtrl',function($scope,AssetsGroupDetailsService,$rootScope,SweetAlert,$translatePartialLoader,trans){

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
    $scope.query ='';


    /*
     * Get all AssetsGroupDetailss
     */
    AssetsGroupDetailsService.list().then(function(data){
        $scope.assetsgroupdetails = data;
        $scope.pagination = $scope.assetsgroupdetails.metadata;
        $scope.maxSize = 5;
    });


    /*
     * Remove selected assetsgroupdetails
     */
    $scope.delete = function(category) {
        SweetAlert.swal($rootScope.areYouSureDelete,
        function(isConfirm){
            if (isConfirm) {
                SweetAlert.swal($rootScope.recordDeleted);
                AssetsGroupDetailsService.delete(category);
            }
        });
    };


    /*
     * Pagination assetsgroupdetails list
     */
    $scope.units = [
        {'id': 10, 'label': 'Show 10 Item Per Page'},
        {'id': 15, 'label': 'Show 15 Item Per Page'},
        {'id': 20, 'label': 'Show 20 Item Per Page'},
        {'id': 30, 'label': 'Show 30 Item Per Page'},
    ]
    $scope.perPage= $scope.units[0];
    $scope.pageChanged = function(per_page) {
        AssetsGroupDetailsService.pageChange($scope.pagination.current_page,per_page.id).then(function(data){
            $scope.assetsgroupdetails = data;
            $scope.pagination = $scope.assetsgroupdetails.metadata;
            $scope.maxSize = 5;
        });
    };


    /*
     * Search in assetsgroupdetails
     */
    $scope.search = function(per_page) {
        AssetsGroupDetailsService.search($scope.query,per_page.id).then(function(data){
            $scope.assetsgroupdetails = data;
            $scope.pagination = $scope.assetsgroupdetails.metadata;
            $scope.maxSize = 5;
        });
    };


    /**********************************************************
     * Event Listener
     **********************************************************/
    // Get list of selected assetsgroupdetails to do actions
    $scope.selection=[];
    $scope.toggleSelection = function toggleSelection(assetsgroupdetailsId) {
        // toggle selection for a given assetsgroupdetails by Id
        var idx = $scope.selection.indexOf(assetsgroupdetailsId);
        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
        }
        // is newly selected
        else {
            $scope.selection.push(assetsgroupdetailsId);
        }
    };

    // update list when assetsgroupdetails deleted
    $scope.$on('assetsgroupdetails.delete', function() {
        AssetsGroupDetailsService.list().then(function(data){
            $scope.assetsgroupdetails =data;
            $scope.selection=[];
        });
    });



});
