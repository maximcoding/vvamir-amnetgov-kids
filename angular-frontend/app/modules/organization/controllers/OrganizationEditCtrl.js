"use strict";

var app = angular.module('ng-laravel', ['ui.bootstrap']);
app.controller('OrganizationEditCtrl', function ($scope, $http, $q, $rootScope, OrganizationService, SubOrganizationService, $stateParams, Notification, $translatePartialLoader, trans) {

    $scope.previousState = $rootScope.previousState;
    /*
     * Define initial value
     */
    $scope.url = 'WHdlX62vMOo8buIoczxZs134Q.jpg';

    /*
     * Get all Organizations
     */


    //  $scope.partners = [{id: 1, name: "Amnetiot", type: "owner"}];
    /*
     * POPULATE LIST FOR SELECT
     * */
    $scope.partners = [];
    $scope.new = {};
    OrganizationService.list().then(function (data) {
        angular.forEach(data, function (object) {
            $scope.partners.push({
                //         organization_id: $scope.organization.id,
                id: object.id,
                name: object.name,
                type: object.type
            })
        })

    }).then(function () {
        $scope.new.partners = [1, 2];
        /*
         *  VIEW CURRENT PARTNERS BY INDEX AS ID
         */
        /*  SubOrganizationService.list().then(function (data) {
         angular.forEach(data, function (object) {
         $scope.new.partners.push(object.id);
         })
         });*/
    });


    // Remote validation
    /* $scope.checkRemote = function(data) {
     var d = $q.defer();
     $http.post('/checkName', {value: data}).then(function(res) {
     res = res || {};
     if(res.status === 'ok') { // {status: "ok"}
     d.resolve()
     } else { // {status: "error", msg: "Username should be `awesome`!"}
     d.resolve(res.msg)
     }
     }).error(function(e) {
     d.reject('Server error!');
     });
     return d.promise;
     };*/


    /*
     * Edit mode organization
     */
    OrganizationService.show($stateParams.id).then(function (organization) {
        $scope.organization = organization;
    });


    /*
     * Update organization
     */
    $scope.update = function (organization) {
        $scope.isDisabled = true;
        OrganizationService.update(organization);
        //    SubOrganizationService.override($scope.new.partners);
    };


    /********************************************************
     * Event Listeners
     * Organization event listener related to OrganizationEditCtrl
     ********************************************************/
    // Edit organization event listener
    $scope.$on('organization.edit', function (scope, organization) {
        $scope.organization = organization;
    });

    // Update organization event listener
    $scope.$on('organization.update', function () {
        Notification({
            message: 'Organization Has Been Updated',
            templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
        }, 'success');
        $scope.isDisabled = false;
    });

    // Organization form validation event listener
    $scope.$on('organization.validationError', function (event, errorData) {
        Notification({
            message: errorData,
            templateUrl: 'app/vendors/angular-ui-notification/tpl/validation.tpl.html'
        }, 'warning');
        $scope.isDisabled = false;
    });

    // Organization form validation event listener
    $scope.$on('organization.failure', function (event, errorData) {
        Notification({
            message: errorData,
            templateUrl: 'app/vendors/angular-ui-notification/tpl/failure.tpl.html'
        }, 'warning');
        $scope.isDisabled = false;
    });


});




