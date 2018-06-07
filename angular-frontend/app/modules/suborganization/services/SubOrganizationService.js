'use strict';

angular.module('ng-laravel').service('SubOrganizationService', function ($rootScope, Restangular) {
    /*
     * Build collection /suborganization
     */
    var _suborganizationService = Restangular.all('suborganization');


    /*
     * Get list of suborganizations
     */
    this.list = function () {
        return _suborganizationService.getList();
    };


    /*
     * Pagination change
     */
    this.pageChange = function (pageNumber, per_page) {
        // GET /api/suborganization?page=2
        return _suborganizationService.getList({
            page: pageNumber,
            per_page: per_page
        });
    };


    /*
     * Show specific suborganization by Id
     */
    this.show = function (id) {
        return _suborganizationService.get(id);
    };


    /*
     * Create suborganization (POST)
     */
    this.override = function (partners) {
        _suborganizationService.post({elements: partners}).then(function (response) {
            $rootScope.$broadcast('suborganization.create');
        }, function (response) {
            $rootScope.$broadcast('suborganization.validationError', response.data.error);
        });
    };


    /*
     * Update suborganization (PUT)
     */
    this.update = function (suborganization) {
        // PUT /api/suborganization/:id
        suborganization.put().then(function () {
            $rootScope.$broadcast('suborganization.update');
        }, function (response) {
            $rootScope.$broadcast('suborganization.validationError', response.data.error);
        });
    };


    /*
     * Delete suborganization
     * To delete multi record you should must use 'Restangular.several'
     */
    this.delete = function (selection) {
        // DELETE /api/suborganization/id1,id2,...
        Restangular.several('suborganization', selection).remove().then(function () {
            $rootScope.$broadcast('suborganization.delete');
        });
    };


    /*
     * Search in suborganizations
     */
    this.search = function (query, per_page) {
        // GET /api/suborganization/search?query=test&per_page=10
        if (query != '') {
            return _suborganizationService.customGETLIST("search", {
                query: query,
                per_page: per_page
            });
        } else {
            return _suborganizationService.getList();
        }
    }


});

