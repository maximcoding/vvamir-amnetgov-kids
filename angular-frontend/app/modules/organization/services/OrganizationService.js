'use strict';

angular.module('ng-laravel').service('OrganizationService', function ($rootScope, $http, Restangular) {
    /*
     * Build collection /organization
     */
    var _organizationService = Restangular.all('organization');

    var _suborganizationService = Restangular.all('suborganization');


    /*
     * Get list of organizations
     */
    this.list = function (data) {
        // GET /api/organization
        return _organizationService.getList(data);
    }

    this.full_list = function(){
        return _organizationService.getList({data:'all'});
    }


    /*
     * get sub organizations
     */

    this.getSubOrganizationList = function () {
        return _suborganizationService.getList();
    }


    /*
     * Pagination change
     */
    this.pageChange = function (pageNumber, per_page) {
        // GET /api/organization?page=2
        return _organizationService.getList({page: pageNumber, per_page: per_page});
    };


    /*
     * Show specific organization by Id
     */
    this.show = function (id) {
        // GET /api/organization/:id
        return _organizationService.get(id);
    };


    /*
     * Create organization (POST)
     */
    this.create = function (organization) {
        // POST /api/organization/:id
        _organizationService.post(organization).then(function (data) {
            $rootScope.$broadcast('organization.create');
        }, function (response) {
            $rootScope.$broadcast('organization.validationError', response.data.error);
        });
    };


    /*
     * Update organization (PUT)
     */
    this.update = function (organization) {
        // PUT /api/organization/:id
        organization.put().then(function (response) {
            console.log(response);
            $rootScope.$broadcast('organization.update');
        }, function (response) {
            switch (response.status) {
                case 500:
                    response.statusText = 'Failed updated Record';
                    $rootScope.$broadcast('organization.failure', response.statusText);
                    break;
                default:
                    $rootScope.$broadcast('organization.validationError', response.data.error);
                    break;
            }
        });
    };

    /*
     * Update organization (PUT)
     */
    this.activate = function (organization) {
        _organizationService.customPOST({}, "activate", organization, {}).then(function () {
            $rootScope.$broadcast('organization.update');
        }, function (response) {
            $rootScope.$broadcast('organization.validationError', response.data.error);
        });
    };


    /*
     * Delete organization
     * To delete multi record you should must use 'Restangular.several'
     */
    this.delete = function (selection) {
        // DELETE /api/organization/id1,id2,...
        Restangular.several('organization', selection).remove().then(function () {
            $rootScope.$broadcast('organization.delete');
        });
    };


    /*
     * Search in organizations
     */
    this.search = function (query, per_page) {
        // GET /api/organization/search?query=test&per_page=10
        if (query != '') {
            return _organizationService.customGETLIST("search", {query: query, per_page: per_page});
        } else {
            return _organizationService.getList();
        }
    }


});

