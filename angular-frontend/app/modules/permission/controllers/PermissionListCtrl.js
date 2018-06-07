"use strict";

var app = angular.module('ng-laravel',['ui.bootstrap']);
app.controller('PermissionListCtrl',function($scope,PermissionService,resolvedItems,$translatePartialLoader,trans){


    /**********************************************************
     * COMMON TO ALL MODULES
     **********************************************************/
    $scope.sortType     = 'name'; // set the default sort type
    $scope.sortReverse  = false;  // set the default sort order
    $scope.searchItem   = '';     // set the default search/filter term

    /*
     * Pagination organization list
     */
    $scope.units = [
        {'id': 10, 'label': '10'},
        {'id': 15, 'label': '15'},
        {'id': 20, 'label': '20'},
        {'id': 30, 'label': '30'},
    ]
    $scope.perPage= $scope.units[0];
    $scope.pageChanged = function(per_page) {
        PermissionService.pageChange($scope.pagination.current_page,per_page.id).then(function(data){
            $scope.permissions = data;
            $scope.pagination = $scope.permissions.metadata;
            $scope.maxSize = 5;
        });
    };
    /*
     * Define initial value
     */
    $scope.query ='';


    /*
     * Get all Permission
     * Get from resolvedItems function in this page route (config.router.js)
     */
    $scope.permissions = resolvedItems;
    $scope.pagination = $scope.permissions.metadata;
    $scope.maxSize = 5;


    /*
     * Get all Task and refresh cache.
     * At first check cache, if exist, we return data from cache and if don't exist return from API
     */
    PermissionService.list().then(function(data){
        $scope.permissions = data;
        $scope.pagination = $scope.permissions.metadata;
    });

    /*
     * Remove selected Permissions
     * my framework work on permissions, Because of that we remove delete function
     */
    //$scope.delete = function(permission) {
    //    SweetAlert.swal({
    //        title: "Are you sure?",
    //        text: "Your will not be able to recover these records!",
    //        type: "warning",
    //        showCancelButton: true,
    //        confirmButtonColor: "#DD6B55",
    //        confirmButtonText: "Yes, delete it!",
    //        cancelButtonText: "No",
    //        closeOnConfirm: false,
    //        closeOnCancel: true,
    //        showLoaderOnConfirm: true
    //    },
    //    function(isConfirm){
    //        if (isConfirm) {
    //            PermissionService.delete(permission);
    //        }
    //    });
    //};




    /*
     * Search in permissions
     */
    $scope.query = '';
    $scope.search = function (query, per_page) {
        PermissionService.search(query, per_page.id).then(function (data) {
            $scope.permissions = data;
            $scope.pagination = $scope.permissions.metadata;
            $scope.maxSize = 5;
        });
    };


    /**********************************************************
     * Event Listener
     **********************************************************/
    // Get list of selected permission to do actions
    $scope.selection=[];
    $scope.toggleSelection = function toggleSelection(permissionId) {
        // toggle selection for a given permission by Id
        var idx = $scope.selection.indexOf(permissionId);
        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
        }
        // is newly selected
        else {
            $scope.selection.push(permissionId);
        }
    };

    //// update list when permission deleted
    //$scope.$on('permission.delete', function() {
    //    SweetAlert.swal("Deleted!", "Your records has been deleted.", "success");
    //    PermissionService.list().then(function(data){
    //        $scope.permissions =data;
    //        $scope.selection=[];
    //    });
    //});
    //
    //// update list when permission not deleted
    //$scope.$on('permission.not.delete', function() {
    //    SweetAlert.swal("Error", "Your records doesn't deleted :(", "error");
    //    PermissionService.list().then(function(data){
    //        $scope.permissions =data;
    //        $scope.selection=[];
    //    });
    //});



});
