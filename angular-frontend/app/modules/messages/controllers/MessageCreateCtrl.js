"use strict";

var app = angular.module('ng-laravel');
app.controller('MessageCreateCtrl',function($scope,MessageService,$translatePartialLoader,Notification,trans){

    /*
     * Define initial value
     */
    $scope.message={};
    $scope.message.avatar_url='';


    /*
     * Create a Message
     */
    $scope.create = function(message) {
        $scope.isDisabled = true;
        MessageService.create(message);
    };

    

    /********************************************************
     * Event Listeners
     * Message event listener related to MessageCreateCtrl
     ********************************************************/
    // Create message event listener
    $scope.$on('message.create', function() {
        $scope.message ={};
        Notification({message: 'category.form.categoryAddSuccess' ,templateUrl:'app/vendors/angular-ui-notification/tpl/success.tpl.html'},'success');
        $scope.isDisabled = false;
    });

    //Validation error in create message event listener
    $scope.$on('message.validationError', function(event,errorData) {
        Notification({message: errorData ,templateUrl:'app/vendors/angular-ui-notification/tpl/validation.tpl.html'},'warning');
        $scope.isDisabled = false;
    });

});