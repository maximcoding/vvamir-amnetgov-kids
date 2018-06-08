"use strict";

var app = angular.module('ng-laravel', ['dropzone']);
app.controller('profileCtrl', function ($scope, $auth, UserService, OrganizationService, RoleService, $stateParams, $http, $translatePartialLoader, Notification, trans) {

    /*
     * Edit mode user
     * Get from resolvedItems function in this page route (config.router.js)
     */
    $scope.user = $auth.getProfile().$$state.value;

    // console.log($scope.user);

    /*
     * Get user and refresh cache.
     * At first check cache, if exist, we return data from cache and if don't exist return from API
     */
    UserService.show_profile($scope.user.id).then(function (data) {
        $scope.other_user_data = data[0];
        //    $scope.user.password = '';
    });

    /*
     * Get all organizations
     * */
    OrganizationService.show($scope.user.organization_id).then(function (data) {
        if (data.length == 1) {
            $scope.default_organization = data[0];
            $scope.user.organization_id = data[0].id;
        }
        $scope.organizations = data;
    });


    /*
     * Get all Roles
     */
    RoleService.show($scope.user.id).then(function (data) {
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
            message: 'user.form.userUpdateSuccess',
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

