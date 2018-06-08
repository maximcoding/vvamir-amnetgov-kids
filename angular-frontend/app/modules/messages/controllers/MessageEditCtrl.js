"use strict";

angular.module('ng-laravel').controller('MessageEditCtrl',function($scope,MessageService,$stateParams,Notification,$translatePartialLoader,trans){


    /*
     * Edit mode message
     */
    MessageService.show($stateParams.id).then(function(message) {
        $scope.message = message;
    });


    /*
     * Update message
     */
    $scope.update = function(message) {
        $scope.isDisabled = true;
        MessageService.update(message);
    };




    /********************************************************
     * Event Listeners
     * Message event listener related to MessageEditCtrl
     ********************************************************/
    // Edit message event listener
    $scope.$on('message.edit', function(scope, message) {
        $scope.message = message;
    });

    // Update message event listener
    $scope.$on('message.update', function() {
        Notification({message: 'category.form.categoryAddSuccess' ,templateUrl:'app/vendors/angular-ui-notification/tpl/success.tpl.html'},'success');
        $scope.isDisabled = false;
    });

    // Message form validation event listener
    $scope.$on('message.validationError', function(event,errorData) {
        Notification({message: errorData ,templateUrl:'app/vendors/angular-ui-notification/tpl/validation.tpl.html'},'warning');
        $scope.isDisabled = false;
    });
});

