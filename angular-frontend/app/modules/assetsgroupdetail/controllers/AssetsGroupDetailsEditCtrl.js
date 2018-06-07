"use strict";

var app = angular.module('ng-laravel');
app.controller('AssetsGroupDetailsEditCtrl',function($scope,AssetsGroupDetailsService,$stateParams,Notification,$translatePartialLoader,trans){

    /*
     * Define initial value
     */
    $scope.url ='WHdlX62vMOo8buIoczxZs134Q.jpg';


    /*
     * Edit mode assetsgroupdetails
     */
    AssetsGroupDetailsService.show($stateParams.id).then(function(assetsgroupdetails) {
        $scope.assetsgroupdetails = assetsgroupdetails;
    });


    /*
     * Update assetsgroupdetails
     */
    $scope.update = function(assetsgroupdetails) {
        $scope.isDisabled = true;
        AssetsGroupDetailsService.update(assetsgroupdetails);
    };




    /********************************************************
     * Event Listeners
     * AssetsDetailsGroup event listener related to AssetsDetailsGroupEditCtrl
     ********************************************************/
    // Edit assetsgroupdetails event listener
    $scope.$on('assetsgroupdetails.edit', function(scope, assetsgroupdetails) {
        $scope.assetsgroupdetails = assetsgroupdetails;
    });

    // Update assetsgroupdetails event listener
    $scope.$on('assetsgroupdetails.update', function() {
        Notification({message: 'category.form.categoryAddSuccess' ,templateUrl:'app/vendors/angular-ui-notification/tpl/success.tpl.html'},'success');
        $scope.isDisabled = false;
    });

    // AssetsDetailsGroup form validation event listener
    $scope.$on('assetsgroupdetails.validationError', function(event,errorData) {
        Notification({message: errorData ,templateUrl:'app/vendors/angular-ui-notification/tpl/validation.tpl.html'},'warning');
        $scope.isDisabled = false;
    });
});

