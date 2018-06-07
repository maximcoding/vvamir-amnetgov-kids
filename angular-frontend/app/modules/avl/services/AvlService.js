'use strict';

angular.module('ng-laravel').service('AvlService', function ($q, $rootScope, Restangular) {
        /*
         * Build collection /avl
         */
        var _avlService = Restangular.all('avl');


        /*
         * Get list of avls
         */
        this.list = function () {
            // GET /api/avl
            return _avlService.getList();
        };


        this.queryAvl = function (key, data) {
            if (data != '') {
                var defer = $q.defer();
                _avlService.customPOST({}, "query", {'key': key, 'data': data}, {}).then(function (response) {
                    defer.resolve(response);
                    $rootScope.$broadcast('avl.show');
                }, function (response) {
                    $rootScope.$broadcast('assetsgroup.validationError', response.data.error);
                    defer.reject(response);
                });
                return defer.promise;
            }
            else {
                return data;
            }
        }

        this.runQuery = function (start, end, organizations, assets, vehicles, persons, checkboxes) {
            console.log({
                'from_date': start,
                'to_date': end,
                'organizations': organizations,
                'assets_categories': assets,
                'assets_vehicles': vehicles,
                'assets_persons': persons,
                'selected_params': checkboxes
            });
            var defer = $q.defer();
            _avlService.post({
                'from_date': start,
                'to_date': end,
                'organizations': organizations,
                'assets_categories': assets,
                'assets_vehicles': vehicles,
                'assets_persons': persons,
                'selected_params': checkboxes
            }).then(function (response) {
                defer.resolve(response);
                if (response.data.length == 0) {
                //    $rootScope.$broadcast('avl.empty');
                  //  return;
                }
                $rootScope.$broadcast('avl.show');
            }, function (response) {
                $rootScope.$broadcast('assetsgroup.validationError', response.data.error);
                defer.reject(response);
            });
            return defer.promise;
        }


        /*    this.search = function (query, per_page) {

         // GET /api/avl/search?query=test&per_page=10
         if (query != '') {
         return _avlService.customGETLIST("search", {query: query, per_page: per_page});
         } else {
         return _avlService.getList();
         }
         }*/


        /*
         * Pagination change
         */
        this.pageChange = function (pageNumber, per_page) {
            // GET /api/avl?page=2
            return _avlService.getList({page: pageNumber, per_page: per_page});
        };


        /*
         * Show specific avl by Id
         */
        this.show = function (id) {
            // GET /api/avl/:id
            return _avlService.get(id);
        };


        /*
         * Create avl (POST)
         */
        this.create = function (avl) {
            // POST /api/avl/:id
            _avlService.post(avl).then(function () {
                $rootScope.$broadcast('avl.create');
            }, function (response) {
                $rootScope.$broadcast('avl.validationError', response.data.error);
            });
        };


        /*
         * Update avl (PUT)
         */
        this.update = function (avl) {
            // PUT /api/avl/:id
            avl.put().then(function () {
                $rootScope.$broadcast('avl.update');
            }, function (response) {
                $rootScope.$broadcast('avl.validationError', response.data.error);
            });
        };


        /*
         * Delete avl
         * To delete multi record you should must use 'Restangular.several'
         */
        this.delete = function (selection) {
            // DELETE /api/avl/id1,id2,...
            Restangular.several('avl', selection).remove().then(function () {
                $rootScope.$broadcast('avl.delete');
            });
        };

        /*
         * Search in organizations
         */
        this.search = function (query, per_page) {
            // GET /api/avl/search?query=test&per_page=10
            if (query != '') {
                return _avlService.customGETLIST("search", {query: query, per_page: per_page});
            } else {
                return _avlService.getList();
            }
        }
    }
);

