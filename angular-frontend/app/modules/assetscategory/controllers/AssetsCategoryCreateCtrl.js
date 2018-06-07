"use strict";

var app = angular.module('ng-laravel');
app.controller('AssetsCategoryCreateCtrl', function ($scope, AssetsCategoryService,$rootScope, $translatePartialLoader, Notification, trans) {

    $scope.previousState = $rootScope.previousState;

    /*
     * Define initial value
     */
    $scope.assetscategory = {};
    $scope.assetscategory.avatar_url = '';
 //   $scope.types = [{type: 'assets', name: 'Vehicles'}, {type: 'assets',name: 'Persons'}, {type: 'assets',name: 'Devices'}];

    /*
     * Create a AssetsCategory
     */
    $scope.create = function (assetscategory) {
        $scope.isDisabled = true;
        AssetsCategoryService.create(assetscategory);
    };

    var category = 'categories_types';
    AssetsCategoryService.list(category).then(function (data) {
        $scope.assets_categories_types = data;
    });



    /********************************************************
     * Event Listeners
     * AssetsCategory event listener related to AssetsCategoryCreateCtrl
     ********************************************************/
    // Create assetscategory event listener
    $scope.$on('assetscategory.create', function () {
        $scope.assetscategory = {};
        Notification({
            message: 'category.form.categoryAddSuccess',
            templateUrl: 'app/vendors/angular-ui-notification/tpl/success.tpl.html'
        }, 'success');
        $scope.isDisabled = false;
    });

    //Validation error in create assetscategory event listener
    $scope.$on('assetscategory.validationError', function (event, errorData) {
        Notification({
            message: errorData,
            templateUrl: 'app/vendors/angular-ui-notification/tpl/validation.tpl.html'
        }, 'warning');
        $scope.isDisabled = false;
    });

});