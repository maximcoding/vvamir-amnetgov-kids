"use strict";

var app = angular.module('ng-laravel', ['dropzone']);
app.controller('UserEditCtrl', function ($scope, UserService,$rootScope, OrganizationService, RoleService, $stateParams, $http, resolvedItems, $translatePartialLoader, Notification, trans) {

    $scope.previousState = $rootScope.previousState;

    /*
     * Edit mode user
     * Get from resolvedItems function in this page route (config.router.js)
     */
    $scope.user = resolvedItems;
    $scope.user.password = '********';// check in backend if equal 8 asterisk, password doesn't change


    /*
     * Get user and refresh cache.
     * At first check cache, if exist, we return data from cache and if don't exist return from API
     */
    UserService.show($stateParams.id).then(function (data) {
        $scope.user = data;
        $scope.user.password = '';
    });

    /*
     * Get all organizations
     * */
    $scope.onSelectOrganization = function ($item, $model, $label) {
        $scope.default_organization = $model;
        $scope.user.organization_id = $model.id;
    };
    $scope.organizations = [];
    $scope.searchOrganization = function (queryOrganization) {
        if (queryOrganization.length > 1) {
            OrganizationService.search(queryOrganization, "50").then(function (response) {
                $scope.organizations = [];
                angular.forEach(response, function (data) {
                    $scope.organizations.push(data);
                })
            });
        }
    }


    /*
     * Get all Roles
     */
    RoleService.list().then(function (data) {
        $scope.roles = data;
    });


    /*
     * Update user
     */
    $scope.update = function (user) {
        $scope.isDisabled = true;
        UserService.update(user);
    };


    /*
     * Dropzone file uploader initial
     */
    $scope.dropzoneConfig = {
        options: { // passed into the Dropzone constructor
            url: '../laravel-backend/public/api/uploadimage',
            paramName: "file", // The name that will be used to transfer the file
            maxFilesize: .5, // MB
            acceptedFiles: 'image/jpeg,image/png,image/gif',
            maxFiles: 1,
            maxfilesexceeded: function (file) {
                this.removeAllFiles();
                this.addFile(file);
            },
            addRemoveLinks: true,
            dictDefaultMessage: '<i class="upload-icon fa fa-cloud-upload blue fa-3x"></i>',
            dictResponseError: 'Error while uploading file!',
        },
        'eventHandlers': {
            'removedfile': function (file, response) {
                $http({
                    method: "POST",
                    url: "../laravel-backend/public/api/deleteimage/" + $scope.user.avatar_url
                }).then(function mySucces(response) {
                    $scope.deleteMessage = response.data;
                    $scope.user.avatar_url = '';
                });
            },
            'success': function (file, response) {
                $scope.user.avatar_url = response.filename;
            }
        }
    };


    /********************************************************
     * Event Listeners
     * User event listener related to UserEditCtrl
     ********************************************************/
    // Edit user event listener
    $scope.$on('user.edit', function (scope, user) {
        $scope.user = user;
    });

    // Update user event listener
    $scope.$on('user.update', function () {
        Notification({
            message: 'app.shared.alert.updated_successfully',
            templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
        }, 'success');
        $scope.isDisabled = false;
    });

    // user form validation event listener
    $scope.$on('user.validationError', function (event, errorData) {
        Notification({
            message: errorData,
            templateUrl: 'app/vendors/angular-ui-notification/tpl/validation.tpl.html'
        }, 'warning');
        $scope.isDisabled = false;
    });
});

