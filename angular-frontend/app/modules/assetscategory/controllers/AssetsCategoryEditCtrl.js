"use strict";

angular.module('ng-laravel').controller('AssetsCategoryEditCtrl', function ($scope, AssetsCategoryService,$rootScope, $stateParams, Notification, $translatePartialLoader, trans) {

    $scope.previousState = $rootScope.previousState;

    /*
     * Define initial value
     */
    $scope.url = 'WHdlX62vMOo8buIoczxZs134Q.jpg';
    $scope.types = [{type: 'assets', name: 'Vehicles'}, {type: 'assets',name: 'Persons'}, {type: 'assets',name: 'Devices'}];


    /*
     * Edit mode assetscategory
     */
    AssetsCategoryService.show($stateParams.id).then(function (assetscategory) {
        $scope.assetscategory = assetscategory;
    });


    /*
     * Update assetscategory
     */
    $scope.update = function (assetscategory) {
        $scope.isDisabled = true;
        AssetsCategoryService.update(assetscategory);
    };


    /********************************************************
     * Event Listeners
     * AssetsCategory event listener related to AssetsCategoryEditCtrl
     ********************************************************/
    // Edit assetscategory event listener
    $scope.$on('assetscategory.edit', function (scope, assetscategory) {
        $scope.assetscategory = assetscategory;
    });

    // Update assetscategory event listener
    $scope.$on('assetscategory.update', function () {
        Notification({
            message: 'category.form.categoryAddSuccess',
            templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
        }, 'success');
        $scope.isDisabled = false;
    });

    // AssetsCategory form validation event listener
    $scope.$on('assetscategory.validationError', function (event, errorData) {
        Notification({
            message: errorData,
            templateUrl: 'app/vendors/angular-ui-notification/tpl/validation.tpl.html'
        }, 'warning');
        $scope.isDisabled = false;
    });
});

