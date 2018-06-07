'use strict';

angular.module('ng-laravel').service('AssetsResourceService', function ($rootScope,$injector, Restangular) {
    /*
     * Build collection /assetsresource
     */
    var _assetsresourceService = Restangular.all('assetsresource');


    /*
     * Get list of assetsresources
     */
    this.list = function () {
        // GET /api/assetsresource
        return _assetsresourceService.getList();
    };
    this.list = function (type, id) {
        // GET /api/assetsresource
        return _assetsresourceService.getList({type: type, asset_id: id});
    };


    this.only_free_list = function (truefalse, type,organization_id) {
        return _assetsresourceService.customGETLIST("", {only_free_list: truefalse, assets_category_type: type,organization_id: organization_id});
    }


    /*
     * Pagination change
     */
    this.pageChange = function (pageNumber, per_page) {
        // GET /api/assetsresource?page=2
        return _assetsresourceService.getList({page: pageNumber, per_page: per_page});
    };


    /*
     * Show specific assetsresource by Id
     */
    this.show = function (id) {
        // GET /api/assetsresource/:id
        return _assetsresourceService.get(id);
    };


    /*
     * Create assetsresource (POST)
     */
    this.create = function (assetsresource) {
        // POST /api/assetsresource/:id
        _assetsresourceService.post(assetsresource).then(function (response) {
            $rootScope.$broadcast('assetsresource.create');
        }, function (response) {
            $rootScope.$broadcast('assetsresource.validationError', response.data.error);
        });
    };


    /*
     * Update assetsresource (PUT)
     */
    this.update = function (assetsresource) {
        // PUT /api/assetsresource/:id
        assetsresource.put().then(function (response) {
            var $state = $injector.get("$state");
            $rootScope.$broadcast('assetsresource.update');
            $state.go('admin.assetsresources');
        }, function (response) {
            $rootScope.$broadcast('assetsresource.validationError', response.data.error);
        });
    };


    /*
     * Delete assetsresource
     * To delete multi record you should must use 'Restangular.several'
     */
    this.delete = function (selection) {
        // DELETE /api/assetsresource/id1,id2,...
        Restangular.several('assetsresource', selection).remove().then(function () {
            $rootScope.$broadcast('assetsresource.delete');
        });
    };


    /*
     * Search in assetsresources
     */
    this.search = function (query, per_page) {
        // GET /api/assetsresource/search?query=test&per_page=10
        if (query != '') {
            return _assetsresourceService.customGETLIST("search", {query: query, per_page: per_page});
        } else {
            return _assetsresourceService.getList();
        }
    }


});

