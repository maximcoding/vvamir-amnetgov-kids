'use strict';

angular.module('ng-laravel').service('AssetsResourceRelationService', function ($q, $rootScope, Restangular) {
    /*
     * Build collection /assetsresourcerelation
     */
    var _assetsresourcerelationService = Restangular.all('assetsresourcerelation');


    /*
     * Get list of assetsresourcerelations
     */
    this.list = function (param) {
        // GET /api/assetsresourcerelation
        return _assetsresourcerelationService.getList();
    };

    this.listPersons = function (persons) {
        // GET /api/assetsresourcerelation
        var defer = $q.defer();
        _assetsresourcerelationService.post({
            'selected_persons': persons
        }).then(function (response) {
            defer.resolve(response);
        }, function (response) {
            defer.reject(response);
        });
        return defer.promise;
    };

    this.listVehicles = function (param) {
        // GET /api/assetsresourcerelation
        return _assetsresourcerelationService.getList({selected_vehicles: param});
    };


    this.list_by_id = function (type, id) {
        // GET /api/assetsresourcerelation
        return _assetsresourcerelationService.customGETLIST("", {asset_type: type, asset_id: id});
    };


    this.only_free_list = function (value) {
        return _assetsresourcerelationService.customGETLIST("", {only_free_list: value});
    }


    /*
     * Pagination change
     */
    this.pageChange = function (pageNumber, per_page) {
        // GET /api/assetsresourcerelation?page=2
        return _assetsresourcerelationService.getList({page: pageNumber, per_page: per_page});
    };


    /*
     * Show specific assetsresourcerelation by Id
     */
    this.show = function (id) {
        // GET /api/assetsresourcerelation/:id
        return _assetsresourcerelationService.get(id);
    };


    /*
     * Create assetsresourcerelation (POST)
     */
    this.create = function (assetsresourcerelation) {
        // POST /api/assetsresourcerelation/:id
        _assetsresourcerelationService.post(assetsresourcerelation).then(function (response) {
            console.log(response);
            $rootScope.$broadcast('assetsresourcerelation.create');
        }, function (response) {
            $rootScope.$broadcast('assetsresourcerelation.validationError', response.data.error);
        });
    };


    /*
     * Update assetsresourcerelation (PUT)
     */
    this.update = function (assetsresourcerelation) {
        // PUT /api/assetsresourcerelation/:id
        assetsresourcerelation.put().then(function () {
            $rootScope.$broadcast('assetsresourcerelation.update');
        }, function (response) {
            $rootScope.$broadcast('assetsresourcerelation.validationError', response.data.error);
        });
    };


    /*
     * Delete assetsresourcerelation
     * To delete multi record you should must use 'Restangular.several'
     */
    this.delete = function (selection) {
        // DELETE /api/assetsresourcerelation/id1,id2,...
        Restangular.several('assetsresourcerelation', selection).remove().then(function () {
            $rootScope.$broadcast('assetsresourcerelation.delete');
        });
    };


    /*
     * Search in assetsresourcerelations
     */
    this.search = function (query, per_page) {
        // GET /api/assetsresourcerelation/search?query=test&per_page=10
        if (query != '') {
            return _assetsresourcerelationService.customGETLIST("search", {query: query, per_page: per_page});
        } else {
            return _assetsresourcerelationService.getList();
        }
    }


});

