'use strict';

angular.module('ng-laravel').service('PointService', function ($rootScope, $stateParams, $state, Restangular) {
    /*
     * Build collection /point
     */
    var _pointService = Restangular.all('points');


    /*
     * Get list of points
     */
    this.list = function () {
        // GET /api/points
        //    $state.transitionTo($state.current, $stateParams, { reload: true, inherit: false, notify: true });
        return _pointService.getList();
    };


    /*
     * Pagination change
     */
    this.pageChange = function (pageNumber, per_page) {
        // GET /api/point?page=2
        return _pointService.getList({page: pageNumber, per_page: per_page});
    };


    /*
     * Show specific point by Id
     */
    this.show = function (id) {
        // GET /api/points/:id
        return _pointService.get(id);
    };

    /*
     * Create point (POST)
     */
    this.create = function (points) {
        // POST /api/points/:id
        _pointService.post({"data": points}).then(function (response) {
            $rootScope.$broadcast('points.create');
            $state.go('admin.points');
        }, function (response) {
            $rootScope.$broadcast('points.validationError', response.data.error);
        });
    };


    /*
     * Update point (PUT)
     */
    this.update = function (point) {
        // PUT /api/points/:id
        point.put().then(function () {
            $rootScope.$broadcast('points.update');
        }, function (response) {
            $rootScope.$broadcast('points.validationError', response.data.error);
        });
    };


    /*
     * Delete point
     * To delete multi record you should must use 'Restangular.several'
     */
    this.delete = function (selection) {
        // DELETE /api/points/id1,id2,...
        Restangular.several('points', selection).remove().then(function (response) {
            $rootScope.$broadcast('points.delete');
        });
    };


    /*
     * Search in points
     */
    this.search = function (query, per_page) {
        // GET /api/points/search?query=test&per_page=10
        if (query != '') {
            return _pointService.customGETLIST("search", {
                query: query,
                per_page: per_page
            });
        } else {
            return _pointService.getList();
        }
    }


});

