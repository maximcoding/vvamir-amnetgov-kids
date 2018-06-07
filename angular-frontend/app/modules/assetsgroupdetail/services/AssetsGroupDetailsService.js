'use strict';

angular.module('ng-laravel').service('AssetsGroupDetailsService', function($rootScope, Restangular) {
    /*
     * Build collection /assetsgroupdetail
     */
    var _assetsgroupdetailsService = Restangular.all('assetsgroupdetail');


    /*
     * Get list of assetsgroupdetail
     */
    this.list = function() {
        // GET /api/assetsgroupdetail
        return _assetsgroupdetailsService.getList();
    };

    this.list_by_group_id = function (id) {
        if (id != '') {
            return _assetsgroupdetailsService.customGETLIST("", {group_id: id});
        }
    }


    /*
     * Pagination change
     */
    this.pageChange = function(pageNumber,per_page) {
        // GET /api/assetsgroupdetail?page=2
        return _assetsgroupdetailsService.getList({page:pageNumber,per_page:per_page});
    };


    /*
     * Show specific assetsgroupdetails by Id
     */
    this.show = function(id) {
        // GET /api/assetsgroupdetail/:id
        return _assetsgroupdetailsService.get(id);
    };


    /*
     * Create assetsgroupdetail (POST)
     */
    this.create = function(details) {
        _assetsgroupdetailsService.post({"details" : details}).then(function(response) {
            $rootScope.$broadcast('assetsgroupdetail.create');
        },function(response) {
            $rootScope.$broadcast('assetsgroupdetail.validationError',response.data.error);
        });
    };


    /*
     * Update assetsgroupdetail (PUT)
     */
    this.update = function(assetsgroupdetails) {
        // PUT /api/assetsgroupdetails/:id
        assetsgroupdetails.put().then(function() {
            $rootScope.$broadcast('assetsgroupdetail.update');
        },function(response) {
            $rootScope.$broadcast('assetsgroupdetail.validationError',response.data.error);
        });
    };


    /*
     * Delete assetsgroupdetail
     * To delete multi record you should must use 'Restangular.several'
     */
    this.delete = function(selection) {
        // DELETE /api/assetsgroupdetails/id1,id2,...
        Restangular.several('assetsgroupdetail',selection).remove().then(function() {
            $rootScope.$broadcast('assetsgroupdetail.delete');
        });
    };


    /*
     * Search in assetsgroupdetailss
     */
    this.search = function(query,per_page) {
        // GET /api/assetsgroupdetail/search?query=test&per_page=10
        if(query !=''){
            return _assetsgroupdetailsService.customGETLIST("search",{query:query, per_page:per_page});
        }else{
            return _assetsgroupdetailsService.getList();
        }
    }


});

