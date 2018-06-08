"use strict";

angular.module('ng-laravel').controller('SubOrganizationCreateCtrl',function($scope,SubOrganizationService,$translatePartialLoader,Notification,trans){

    /*
     * Define initial value
     */
    $scope.suborganization={};
    $scope.suborganization.avatar_url='';


    /*
     * Create a SubOrganization
     */
    $scope.create = function(suborganization) {
        $scope.isDisabled = true;
        SubOrganizationService.create(suborganization);
    };

    

    /********************************************************
     * Event Listeners
     * SubOrganization event listener related to SubOrganizationCreateCtrl
     ********************************************************/
    // Create suborganization event listener
    $scope.$on('suborganization.create', function() {
        $scope.suborganization ={};
        Notification({message: 'category.form.categoryAddSuccess' ,templateUrl:'app/vendors/angular-ui-notification/tpl/success.tpl.html'},'success');
        $scope.isDisabled = false;
    });

    //Validation error in create suborganization event listener
    $scope.$on('suborganization.validationError', function(event,errorData) {
        Notification({message: errorData ,templateUrl:'app/vendors/angular-ui-notification/tpl/validation.tpl.html'},'warning');
        $scope.isDisabled = false;
    });

});