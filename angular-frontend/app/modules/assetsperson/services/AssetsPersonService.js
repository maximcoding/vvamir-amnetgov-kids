'use strict';

angular.module('ng-laravel').service('AssetsPersonService', function ($rootScope, $injector, Restangular) {
    /*
     * Build collection /assetsperson
     */
    var _assetspersonService = Restangular.all('assetsperson');


    /*
     * Get list of assetspersons
     */
    this.list = function (organization_id) {
        // GET /api/assetsperson
        return _assetspersonService.getList({page: 1, per_page: 10, organization_id: organization_id});
    };

    this.list_by_id = function (organization_id) {
        // GET /api/assetsperson
        return _assetspersonService.getList({organization_id: organization_id});
    };


    /*
     * Pagination change
     */
    this.pageChange = function (pageNumber, per_page) {
        // GET /api/assetsperson?page=2
        return _assetspersonService.getList({page: pageNumber, per_page: per_page});
    };


    /*
     * Show specific assetsperson by Id
     */
    this.show = function (id) {
        // GET /api/assetsperson/:id
        return _assetspersonService.get(id);
    };


    /*
     * Create assetsperson (POST)
     */
    this.create = function (assetsperson) {
        // POST /api/assetsperson/:id
        _assetspersonService.post(assetsperson).then(function (response) {
            $rootScope.$broadcast('assetsperson.create');
        }, function (response) {
            $rootScope.$broadcast('assetsperson.validationError', response.data.error);
        });
    };


    /*
     * Update assetsperson (PUT)
     */


    this.update = function (assetsperson) {
        assetsperson.update = true;
        // PUT /api/assetsvehicle/:id
        _assetspersonService.post(assetsperson).then(function (response) {
            console.log('updated ' + response);
            $rootScope.$broadcast('assetsperson.update');
            var $state = $injector.get("$state");
            $state.go('admin.assetspersons');
        }, function (response) {
            console.log('error ' + JSON.stringify(response));
            $rootScope.$broadcast('assetsperson.validationError', response.data.error);
        });
    };


    /*
     * Delete assetsperson
     * To delete multi record you should must use 'Restangular.several'
     */
    this.delete = function (selection) {
        // DELETE /api/user/:id
        Restangular.several('assetsperson', selection).remove().then(function (response) {
            $rootScope.$broadcast('assetsperson.delete');
        }, function (response) {
            $rootScope.$broadcast('assetsperson.not.delete');
        });
    };


    /*
     * Search in assetspersons
     */
    this.search = function (query, per_page) {
        // GET /api/assetsperson/search?query=test&per_page=10
        if (query != '') {
            return _assetspersonService.customGETLIST("search", {query: query, per_page: per_page});
        } else {
            return _assetspersonService.getList();
        }
    }

    this.activate = function (data_to_send) {
        // PUT /api/assetsvehicle/:id
        data_to_send.put({activate: data_to_send}).then(function (response) {
            $rootScope.$broadcast('assetsvehicle.update');
        }, function (response) {
            $rootScope.$broadcast('assetsvehicle.validationError', response.data.error);
        });
    };


});

