'use strict';

angular.module('ng-laravel').service('AssetsCategoryService', function ($rootScope, Restangular) {
    /*
     * Build collection /assetscategory
     */
    var _assetscategoryService = Restangular.all('assetscategory');


    /*
     * Get list of assetscategories
     */
    this.list = function (category) {
        // GET /api/assetscategory
        return _assetscategoryService.getList({category: category});
    };


    /*
     * Pagination change
     */
    this.pageChange = function (pageNumber, per_page) {
        // GET /api/assetscategory?page=2
        return _assetscategoryService.getList({page: pageNumber, per_page: per_page});
    };


    /*
     * Show specific assetscategory by Id
     */
    this.show = function (id) {
        // GET /api/assetscategory/:id
        return _assetscategoryService.get(id);
    };


    /*
     * Create assetscategory (POST)
     */
    this.create = function (assetscategory) {
        // POST /api/assetscategory/:id
        _assetscategoryService.post(assetscategory).then(function () {
            $rootScope.$broadcast('assetscategory.create');
        }, function (response) {
            $rootScope.$broadcast('assetscategory.validationError', response.data.error);
        });
    };


    /*
     * Update assetscategory (PUT)
     */
    this.update = function (assetscategory) {
        // PUT /api/assetscategory/:id
        assetscategory.put().then(function () {
            $rootScope.$broadcast('assetscategory.update');
        }, function (response) {
            $rootScope.$broadcast('assetscategory.validationError', response.data.error);
        });
    };


    /*
     * Delete assetscategory
     * To delete multi record you should must use 'Restangular.several'
     */
    this.delete = function (selection) {
        // DELETE /api/assetscategory/id1,id2,...
        Restangular.several('assetscategory', selection).remove().then(function () {
            $rootScope.$broadcast('assetscategory.delete');
        });
    };


    /*
     * Search in assetscategories
     */
    this.search = function (query, per_page) {
        // GET /api/assetscategory/search?query=test&per_page=10
        if (query != '') {
            return _assetscategoryService.customGETLIST("search", {query: query, per_page: per_page});
        } else {
            return _assetscategoryService.getList();
        }
    }


});

