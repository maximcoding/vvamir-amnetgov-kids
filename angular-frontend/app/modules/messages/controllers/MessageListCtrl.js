"use strict";

var app = angular.module('ng-laravel',['ui.bootstrap']);
app.controller('MessageListCtrl',function($scope,MessageService,$rootScope,SweetAlert,$translatePartialLoader,trans){

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
     * Get all Messages
     */
    MessageService.list().then(function(data){
        $scope.messages = data;
        $scope.pagination = $scope.messages.metadata;
        $scope.maxSize = 5;
    });


    /*
     * Remove selected messages
     */
    $scope.delete = function(category) {
        SweetAlert.swal($rootScope.areYouSureDelete,
        function(isConfirm){
            if (isConfirm) {
                SweetAlert.swal($rootScope.recordDeleted);
                MessageService.delete(category);
            }
        });
    };


    /*
     * Pagination message list
     */
    $scope.units = [
        {'id': 10, 'label': 'Show 10 Item Per Page'},
        {'id': 15, 'label': 'Show 15 Item Per Page'},
        {'id': 20, 'label': 'Show 20 Item Per Page'},
        {'id': 30, 'label': 'Show 30 Item Per Page'},
    ]
    $scope.perPage= $scope.units[0];
    $scope.pageChanged = function(per_page) {
        MessageService.pageChange($scope.pagination.current_page,per_page.id).then(function(data){
            $scope.messages = data;
            $scope.pagination = $scope.messages.metadata;
            $scope.maxSize = 5;
        });
    };


    /*
     * Search in messages
     */
    $scope.search = function(per_page) {
        MessageService.search($scope.query,per_page.id).then(function(data){
            $scope.messages = data;
            $scope.pagination = $scope.messages.metadata;
            $scope.maxSize = 5;
        });
    };


    /**********************************************************
     * Event Listener
     **********************************************************/
    // Get list of selected message to do actions
    $scope.selection=[];
    $scope.toggleSelection = function toggleSelection(messageId) {
        // toggle selection for a given message by Id
        var idx = $scope.selection.indexOf(messageId);
        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
        }
        // is newly selected
        else {
            $scope.selection.push(messageId);
        }
    };

    // update list when message deleted
    $scope.$on('message.delete', function() {
        MessageService.list().then(function(data){
            $scope.messages =data;
            $scope.selection=[];
        });
    });



});
