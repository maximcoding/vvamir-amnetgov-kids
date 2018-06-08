"use strict";

angular.module('ng-laravel').controller('OrganizationViewCtrl', function ($scope,$rootScope, OrganizationService, SubOrganizationService, $stateParams, $translatePartialLoader, trans) {

    $scope.previousState = $rootScope.previousState;

    /*
     * Show organization
     */
    OrganizationService.show($stateParams.id).then(function (organization) {
        $scope.organization = {};
        $scope.organization = organization;
        $scope.partners = [];
        $scope.isSaving = true;
    }).then(function () {
        SubOrganizationService.list().then(function (data) {
            angular.forEach(data, function (object) {
                if ($scope.organization.id == object.organization_id) {
                    $scope.partners.push(object);
                }
            });
        }).then(function(){
            console.log($scope.partners);
        })
    });

});

