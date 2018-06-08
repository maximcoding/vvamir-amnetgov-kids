"use strict";

angular.module('ng-laravel').controller('RoleCreateCtrl', function ($scope, RoleService, PermissionService, $http, $rootScope, resolvedItems, $translatePartialLoader, Notification, trans) {

    $scope.previousState = $rootScope.previousState;

    /*
     * Define initial value
     */
    $scope.role = {};


    /*
     * Create a role
     */
    $scope.create = function (role) {
        $scope.isDisabled = true;
        RoleService.create(role);
    };


    /*
     * Get all Permission
     * Get from resolvedItems function in this page route (config.router.js)
     */
    var data = resolvedItems;
    var _tmp = {};
    // Convert from arrayObject to single object
    data.forEach(function (o) {
        _tmp[o.display_name] = 0;
    });
    $scope.permissions = _tmp;


    /********************************************************
     * Event Listeners
     * role event listener related to RoleCreateCtrl
     ********************************************************/
    // Create role event listener
    $scope.$on('role.create', function () {
        $scope.role = {};
        Notification({
            message: 'app.shared.alert.created_successfully',
            templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
        }, 'success');
        $scope.isDisabled = false;
    });

    //Validation error in create user event listener
    $scope.$on('role.failure', function (event, errorData) {
        Notification({
            message: 'app.shared.alert.at_least_one_permission',
            templateUrl: 'app/vendors/angular-ui-notification/tpl/failure.tpl.html'
        }, 'warning');
        $scope.isDisabled = false;
    });

    //Validation error in create role event listener
    $scope.$on('role.validationError', function (event, errorData) {
        Notification({
            message: errorData,
            templateUrl: 'app/vendors/angular-ui-notification/tpl/validation.tpl.html'
        }, 'warning');
        $scope.isDisabled = false;
    });

});