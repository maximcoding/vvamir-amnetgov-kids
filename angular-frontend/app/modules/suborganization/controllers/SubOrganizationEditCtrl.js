"use strict";

angular.module('ng-laravel').controller('SubOrganizationEditCtrl',function($scope,SubOrganizationService,$stateParams,Notification,$translatePartialLoader,trans){

    /*
     * Define initial value
     */
    $scope.url ='WHdlX62vMOo8buIoczxZs134Q.jpg';


    /*
     * Edit mode suborganization
     */
    SubOrganizationService.show($stateParams.id).then(function(suborganization) {
        $scope.suborganization = suborganization;
    });


    /*
     * Update suborganization
     */
    $scope.update = function(suborganization) {
        $scope.isDisabled = true;
        SubOrganizationService.update(suborganization);
    };




    /********************************************************
     * Event Listeners
     * SubOrganization event listener related to SubOrganizationEditCtrl
     ********************************************************/
    // Edit suborganization event listener
    $scope.$on('suborganization.edit', function(scope, suborganization) {
        $scope.suborganization = suborganization;
    });

    // Update suborganization event listener
    $scope.$on('suborganization.update', function() {
        Notification({message: 'category.form.categoryAddSuccess' ,templateUrl:'app/vendors/angular-ui-notification/tpl/success.tpl.html'},'success');
        $scope.isDisabled = false;
    });

    // SubOrganization form validation event listener
    $scope.$on('suborganization.validationError', function(event,errorData) {
        Notification({message: errorData ,templateUrl:'app/vendors/angular-ui-notification/tpl/validation.tpl.html'},'warning');
        $scope.isDisabled = false;
    });
});

