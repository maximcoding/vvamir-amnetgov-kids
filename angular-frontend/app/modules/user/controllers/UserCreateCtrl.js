"use strict";

var app = angular.module('ng-laravel', ['dropzone']);
app.controller('UserCreateCtrl', function ($scope, UserService, OrganizationService, RoleService, $http, $rootScope, $translatePartialLoader, trans, Notification) {

    $scope.previousState = $rootScope.previousState;

    /*
     * Define initial value
     */
    $scope.user = {};
    $scope.roles = [];
    $scope.user.avatar_url = '';


    /*
     * Create a user
     */
    $scope.create = function (user) {
        //  $scope.isDisabled = true;
        UserService.create(user);
    };


    /*
     * Get all Roles
     * Get from resolvedItems function in this page route (config.router.js)
     */
    RoleService.list().then(function (data) {
        $scope.roles = data;
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
     * user event listener related to UserCreateCtrl
     ********************************************************/
    // Create user event listener
    $scope.$on('user.create', function () {
        if ($scope.user.avatar_url = '') {

            $scope.user.avatar_url = 'no_avatar.jpg';
        }
        $scope.user = {};
        $rootScope.$broadcast('dropzone.removeallfile');
        Notification({
            message: 'app.shared.alert.created_successfully',
            templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
        }, 'success');
        $scope.isDisabled = false;
    });

    //Validation error in create user event listener
    $scope.$on('user.validationError', function (event, errorData) {
        Notification({
            message: errorData,
            templateUrl: 'app/vendors/angular-ui-notification/tpl/validation.tpl.html'
        }, 'warning');
        $scope.isDisabled = false;
    });

    //Validation error in create user event listener
    $scope.$on('user.failure', function (event, errorData) {
        Notification({
            message: errorData,
            templateUrl: 'app/vendors/angular-ui-notification/tpl/failure.tpl.html'
        }, 'warning');
        $scope.isDisabled = false;
    });

});