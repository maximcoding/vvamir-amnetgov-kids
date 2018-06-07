'use strict';

angular.module('ng-laravel').service('AssetsVehicleService', function ($q, $rootScope, $injector, Restangular) {
    /*
     * Build collection /assetsvehicle
     */
    var _assetsvehicleService = Restangular.all('assetsvehicle');


    /*
     * Get list of assetsvehicles
     */
    this.list = function () {
        // GET /api/assetsvehicle
        return _assetsvehicleService.getList();
    };

    /*
     * Get list of assetsvehicles
     */
    this.list_by_id = function (id) {
        // GET /api/assetsvehicle
        return _assetsvehicleService.getList({organization_id: id});
    };

    /*
     * Pagination change
     */
    this.pageChange = function (pageNumber, per_page) {
        // GET /api/assetsvehicle?page=2
        return _assetsvehicleService.getList({page: pageNumber, per_page: per_page});
    };


    /*
     * Show specific assetsvehicle by Id
     */
    this.show = function (id) {
        // GET /api/assetsvehicle/:id
        return _assetsvehicleService.get(id);
    };


    /*
     * Create assetsvehicle (POST)
     */
    this.create = function (data) {
        // POST /api/assetsvehicle/:id
        _assetsvehicleService.post(data).then(function (response) {
            $rootScope.$broadcast('assetsvehicle.create');
        }, function (response) {
            $rootScope.$broadcast('assetsvehicle.validationError', response.data.error);
        });
    };


    /*
     * Create assetsgroup (POST)
     */
    /* 
     this.create = function (name, id) {
     var defer = $q.defer();
     _assetsvehicleService.post({"group_name": name, "organization_id": id}).then(function (create_group_id) {
     defer.resolve(create_group_id);
     $rootScope.$broadcast('assetsvehicle.create');
     }, function (response) {
     $rootScope.$broadcast('assetsvehicle.validationError', response.data.error);
     defer.reject(response);
     });
     return defer.promise;
     };
     */


    /*
     * Update assetsvehicle (PUT)
     */
    this.update = function (assetsvehicle) {
        // PUT /api/assetsvehicle/:id
        assetsvehicle.put().then(function () {
            $rootScope.$broadcast('assetsvehicle.update');
            var $state = $injector.get("$state");
            $state.go('admin.assetsvehicles');
        }, function (response) {
            $rootScope.$broadcast('assetsvehicle.validationError', response.data.error);
        });
    };


    /*
     * Delete assetsvehicle
     * To delete multi record you should must use 'Restangular.several'
     */
    this.delete = function (selection) {
        // DELETE /api/assetsvehicle/id1,id2,...
        Restangular.several('assetsvehicle', selection).remove().then(function () {
            $rootScope.$broadcast('assetsvehicle.delete');
        });
    };


    /*
     * Search in assetsvehicles
     */
    this.search = function (query, per_page) {
        // GET /api/assetsvehicle/search?query=test&per_page=10
        if (query != '') {
            return _assetsvehicleService.customGETLIST("search", {query: query, per_page: per_page});
        } else {
            return _assetsvehicleService.getList();
        }
    }

    /*
     * Update organization (PUT)
     */
    this.activate = function (data) {
        // PUT /api/assetsvehicle/:id
        data.put({activate: data}).then(function (response) {
            $rootScope.$broadcast('assetsvehicle.update');
        }, function (response) {
            $rootScope.$broadcast('assetsvehicle.validationError', response.data.error);
        });
    };


});

