"use strict";

var app = angular.module('ng-laravel');
app.controller('AssetsGroupDetailsCreateCtrl',function($scope,AssetsGroupDetailsService,AssetsDetailsGroupService,$translatePartialLoader,Notification,trans){

    /*
     * Define initial value
     */
    $scope.assetsgroupdetails={};
    $scope.assetsgroupdetails.avatar_url='';


    /*
     * Create a AssetsDetailsGroup
     */
    $scope.create = function(assetsgroupdetails) {
        $scope.isDisabled = true;
        AssetsGroupDetailsService.create(assetsgroupdetails);
    };

    

    /********************************************************
     * Event Listeners
     * AssetsDetailsGroup event listener related to AssetsDetailsGroupCreateCtrl
     ********************************************************/
    // Create assetsgroupdetails event listener
    $scope.$on('assetsgroupdetails.create', function() {
        $scope.assetsgroupdetails ={};
        Notification({message: 'category.form.categoryAddSuccess' ,templateUrl:'app/vendors/angular-ui-notification/tpl/success.tpl.html'},'success');
        $scope.isDisabled = false;
    });

    //Validation error in create assetsgroupdetails event listener
    $scope.$on('assetsgroupdetails.validationError', function(event,errorData) {
        Notification({message: errorData ,templateUrl:'app/vendors/angular-ui-notification/tpl/validation.tpl.html'},'warning');
        $scope.isDisabled = false;
    });

});