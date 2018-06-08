'use strict';

angular.module('ng-laravel').service('AssetsGroupService', function ($rootScope, $q, Restangular, $injector) {
    /*
     * Build collection /assetsgroup
     */
    var _assetsgroupService = Restangular.all('assetsgroup');


    /*
     * Get list of assetsgroups
     */
    this.list = function () {
        // GET /api/assetsgroup
        return _assetsgroupService.getList();
    };


    /*
     * Pagination change
     */
    this.pageChange = function (pageNumber, per_page) {
        // GET /api/assetsgroup?page=2
        return _assetsgroupService.getList({page: pageNumber, per_page: per_page});
    };


    /*
     * Show specific assetsgroup by Id
     */
    this.show = function (id) {
        // GET /api/assetsgroup/:id
        return _assetsgroupService.get(id);
    };


    /*
     * Create assetsgroup (POST)
     */
    this.create = function (name, id) {
        // POST /api/assetsgroup/:id
        var defer = $q.defer();
        _assetsgroupService.post({"group_name": name, "organization_id": id}).then(function (create_group_id) {
            defer.resolve(create_group_id);
            //   $rootScope.$broadcast('assetsgroup.create');
        }, function (response) {
            //    $rootScope.$broadcast('assetsgroup.validationError', response.data.error);
            defer.reject(response);
        });
        return defer.promise;
    };


    /*
     * Update assetsgroup (PUT)
     */
    this.update = function (assetsgroup) {
        // PUT /api/assetsgroup/:id
        var defer = $q.defer();
        _assetsgroupService.customPOST({}, "customUpdate", assetsgroup, {}).then(function (response) {
            defer.resolve(response);
            $rootScope.$broadcast('assetsgroup.update');
        }, function (response) {
            $rootScope.$broadcast('assetsgroup.validationError', response.data.error);
            defer.reject(response);
        });
        return defer.promise;
    };


    /*
     * Delete assetsgroup
     * To delete multi record you should must use 'Restangular.several'
     */
    this.delete = function (selection) {
        // DELETE /api/assetsgroup/id1,id2,...
        Restangular.several('assetsgroup', selection).remove().then(function (response) {
            $rootScope.$broadcast('assetsgroup.delete');
        });
    };


    /*
     * Search in assetsgroups
     */
    this.search = function (query, per_page) {
        // GET /api/assetsgroup/search?query=test&per_page=10
        if (query != '') {
            return _assetsgroupService.customGETLIST("search", {query: query, per_page: per_page});
        } else {
            return _assetsgroupService.getList();
        }
    }


});

