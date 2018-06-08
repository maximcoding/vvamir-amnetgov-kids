"use strict";

angular.module('ng-laravel').controller('WatcherGroupEditCtrl',function($scope,$rootScope,WatcherGroupService,$stateParams,Notification,$translatePartialLoader,trans){

    $scope.previousState = $rootScope.previousState;

    /*
     * Define initial value
     */
    $scope.url ='WHdlX62vMOo8buIoczxZs134Q.jpg';


    /*
     * Edit mode groupwatcher
     */
    WatcherGroupService.show($stateParams.id).then(function(groupwatcher) {
        $scope.groupwatcher = groupwatcher;
    });


    /*
     * Update groupwatcher
     */
    $scope.update = function(groupwatcher) {
        $scope.isDisabled = true;
        WatcherGroupService.update(groupwatcher);
    };




    /********************************************************
     * Event Listeners
     * WatcherGroup event listener related to WatcherGroupEditCtrl
     ********************************************************/
    // Edit groupwatcher event listener
    $scope.$on('groupwatcher.edit', function(scope, groupwatcher) {
        $scope.groupwatcher = groupwatcher;
    });

    // Update groupwatcher event listener
    $scope.$on('groupwatcher.update', function() {
        Notification({
            message: 'app.shared.alert.updated_successfully',
            templateUrl:'app/vendors/angular-ui-notification/tpl/success.tpl.html'},'success');
        $scope.isDisabled = false;
    });

    // WatcherGroup form validation event listener
    $scope.$on('groupwatcher.validationError', function(event,errorData) {
        Notification({message: errorData ,templateUrl:'app/vendors/angular-ui-notification/tpl/validation.tpl.html'},'warning');
        $scope.isDisabled = false;
    });
});

