"use strict";

angular.module('ng-laravel').controller('RoleEditCtrl', function ($scope,$rootScope, RoleService, $stateParams, resolvedItems, $translatePartialLoader, Notification, trans) {

    $scope.previousState = $rootScope.previousState;

    function chunk(arr, size) {
        var newArr = [];
        for (var i=0; i<arr.length; i+=size) {
            newArr.push(arr.slice(i, i+size));
        }
        return newArr;
    }

    /*
     * Edit mode Role
     * Get from resolvedItems function in this page route (config.router.js)
     */
    $scope.role = resolvedItems;
    $scope.permissions = resolvedItems.permission;


    /*
     * Get role and refresh cache.
     * At first check cache, if exist, we return data from cache and if don't exist return from API
     */
    RoleService.show($stateParams.id).then(function (data) {
        $scope.role = data;
        $scope.permissions = data.permission;
    });


    /*
     * Update Role
     */
    $scope.update = function (role) {
        $scope.isDisabled = true;
        RoleService.update(role);
    };


    /********************************************************
     * Event Listeners
     * Role event listener related to RoleEditCtrl
     ********************************************************/
    // Edit role event listener
    $scope.$on('role.edit', function (scope, role) {
        $scope.role = role;
    });

    // Update role event listener
    $scope.$on('role.update', function () {
        Notification({
            message: 'app.shared.alert.updated_successfully',
            templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
        }, 'success');
        $scope.isDisabled = false;
    });

    // Role form validation event listener
    $scope.$on('role.validationError', function (event, errorData) {
        Notification({
            message: errorData,
            templateUrl: 'app/vendors/angular-ui-notification/tpl/validation.tpl.html'
        }, 'warning');
        $scope.isDisabled = false;
    });
});
