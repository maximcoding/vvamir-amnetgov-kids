'use strict';

angular.module('ng-laravel').service('WatcherGroupService', function ($q, $state, $rootScope, $injector, Restangular) {
        /*
         * Build collection /groupwatcher
         */
        var _groupwatcherService = Restangular.all('groupwatcher');


        /*
         * Get list of groupwatchers
         */
        this.list = function () {
            // GET /api/groupwatcher
            return _groupwatcherService.getList();
        };

        this.list_by_group_id = function (id) {
            if (id != '') {
                return _groupwatcherService.customGETLIST("", {group_id: id});
            }
        }

        /*
         * Pagination change
         */
        this.pageChange = function (pageNumber, per_page) {
            // GET /api/groupwatcher?page=2
            return _groupwatcherService.getList({page: pageNumber, per_page: per_page});
        };


        /*
         * Show specific groupwatcher by Id
         */
        this.show = function (id) {
            // GET /api/groupwatcher/:id
            return _groupwatcherService.get(id);
        };


        /*
         * Create groupwatcher (POST)
         */
        this.create = function (watchers, details) {
            // POST /api/watchergroup/:id
            //   var defer = $q.defer();
            _groupwatcherService.post({"watchers": watchers, "group_details": details}).then(function (response) {
                var $state = $injector.get("$state");
                $rootScope.$broadcast('assetsgroup.create');
                $state.go('admin.assetsgroups');
                //    defer.resolve(response);
            }, function (response) {
                $rootScope.$broadcast('assetsgroup.validationError', response.data.error);
                $state.go('admin.createAssetsGroup');
                //       defer.reject(response);
            });
            //    return defer.promise;
        };


        /*
         * Update groupwatcher (PUT)
         */
        this.update = function (group_id, watchers, details) {
            // PUT /api/groupwatcher/:id
            _groupwatcherService.post({
                "group_id": group_id,
                "watchers": watchers,
                "group_details": details
            }).then(function (response) {
                $rootScope.$broadcast('watchergroup.update');
                var $state = $injector.get("$state");
                $state.go('admin.assetsgroups');
            }, function (response) {
                $rootScope.$broadcast('watchergroup.validationError', response.data.error);
            });
        };


        /*
         * Delete groupwatcher
         * To delete multi record you should must use 'Restangular.several'
         */
        this.delete = function (selection) {
            // DELETE /api/groupwatcher/id1,id2,...
            Restangular.several('groupwatcher', selection).remove().then(function () {
                $rootScope.$broadcast('groupwatcher.delete');
            });
        };


        /*
         * Search in groupwatchers
         */
        this.search = function (query, per_page) {
            // GET /api/groupwatcher/search?query=test&per_page=10
            if (query != '') {
                return _groupwatcherService.customGETLIST("search", {query: query, per_page: per_page});
            } else {
                return _groupwatcherService.getList();
            }
        }


    }
);

