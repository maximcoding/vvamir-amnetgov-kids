"use strict";

angular.module('ng-laravel').controller('WatcherGroupCreateCtrl',function($scope,$rootScope,WatcherGroupService,$translatePartialLoader,Notification,trans){

    $scope.previousState = $rootScope.previousState;

    /*
     * Define initial value
     */
    $scope.groupwatcher={};
    $scope.groupwatcher.avatar_url='';


    /*
     * Create a WatcherGroup
     */
    $scope.create = function(groupwatcher) {
        $scope.isDisabled = true;
        WatcherGroupService.create(groupwatcher);
    };

    

    /********************************************************
     * Event Listeners
     * WatcherGroup event listener related to WatcherGroupCreateCtrl
     ********************************************************/
    // Create groupwatcher event listener
    $scope.$on('groupwatcher.create', function() {
        $scope.groupwatcher ={};
        Notification({
            message: 'app.shared.alert.created_successfully',
            templateUrl:'app/vendors/angular-ui-notification/tpl/success.tpl.html'},'success');
        $scope.isDisabled = false;
    });

    //Validation error in create groupwatcher event listener
    $scope.$on('groupwatcher.validationError', function(event,errorData) {
        Notification({message: errorData ,templateUrl:'app/vendors/angular-ui-notification/tpl/validation.tpl.html'},'warning');
        $scope.isDisabled = false;
    });

});