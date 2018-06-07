"use strict";

var app = angular.module('ng-laravel',['ui.bootstrap']);
app.controller('SubOrganizationListCtrl',function($scope,SubOrganizationService,$rootScope,SweetAlert,$translatePartialLoader,trans){

    /*
     * Define initial value
     */
    $scope.query ='';


    /*
     * Get all SubOrganizations
     */
    SubOrganizationService.list().then(function(data){
        $scope.suborganizations = data;
        $scope.pagination = $scope.suborganizations.metadata;
        $scope.maxSize = 5;
    });


    /*
     * Remove selected suborganizations
     */
    $scope.delete = function(category) {
        SweetAlert.swal($rootScope.areYouSureDelete,
        function(isConfirm){
            if (isConfirm) {
                SweetAlert.swal($rootScope.recordDeleted);
                SubOrganizationService.delete(category);
            }
        });
    };


    /*
     * Pagination suborganization list
     */
    $scope.units = [
        {'id': 10, 'label': 'Show 10 Item Per Page'},
        {'id': 15, 'label': 'Show 15 Item Per Page'},
        {'id': 20, 'label': 'Show 20 Item Per Page'},
        {'id': 30, 'label': 'Show 30 Item Per Page'},
    ]
    $scope.perPage= $scope.units[0];
    $scope.pageChanged = function(per_page) {
        SubOrganizationService.pageChange($scope.pagination.current_page,per_page.id).then(function(data){
            $scope.suborganizations = data;
            $scope.pagination = $scope.suborganizations.metadata;
            $scope.maxSize = 5;
        });
    };


    /*
     * Search in suborganizations
     */
    $scope.search = function(per_page) {
        SubOrganizationService.search($scope.query,per_page.id).then(function(data){
            $scope.suborganizations = data;
            $scope.pagination = $scope.suborganizations.metadata;
            $scope.maxSize = 5;
        });
    };


    /**********************************************************
     * Event Listener
     **********************************************************/
    // Get list of selected suborganization to do actions
    $scope.selection=[];
    $scope.toggleSelection = function toggleSelection(suborganizationId) {
        // toggle selection for a given suborganization by Id
        var idx = $scope.selection.indexOf(suborganizationId);
        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
        }
        // is newly selected
        else {
            $scope.selection.push(suborganizationId);
        }
    };

    // update list when suborganization deleted
    $scope.$on('suborganization.delete', function() {
        SubOrganizationService.list().then(function(data){
            $scope.suborganizations =data;
            $scope.selection=[];
        });
    });



});
