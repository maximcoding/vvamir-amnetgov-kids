'use strict';

angular.module('ng-laravel').service('UserService', function ($rootScope, $injector, Restangular, CacheFactory) {
    /*
     * Build collection /user
     */
    var _userService = Restangular.all('user');
    if (!CacheFactory.get('usersCache')) {
        var usersCache = CacheFactory('usersCache');
    }

    /*
     * Get list of users from cache.
     * if cache is empty, data fetched and cache create else retrieve from cache
     */
    this.cachedList = function () {
        // GET /api/user
        if (!usersCache.get('list')) {
            return this.list();
        } else {
            return usersCache.get('list');
        }
    };


    /*
     * Get list of users
     */
    this.list = function (organization_id) {
        // GET /api/user
        if (organization_id) {
            var data = _userService.getList({organization_id: organization_id});
        }
        if (!organization_id) {
            var data = _userService.getList();
        }
        usersCache.put('list', data);
        return data;
    };


    /*
     * Pagination change
     */
    this.pageChange = function (pageNumber, per_page) {
        // GET /api/user?page=2
        return _userService.getList({page: pageNumber, per_page: per_page});
    };


    this.cachedShow = function (id) {
        // GET /api/user/:id
        if (!usersCache.get('show' + id)) {
            return this.show(id);
        } else {
            return usersCache.get('show' + id);
        }
    };

    /*
     * Show specific user by Id
     */
    this.show = function (id) {
        // GET /api/user/:id
        var data = _userService.get(id);
        usersCache.put('show' + id, data);
        return data;
    };


    /*
     * Create user (POST)
     */
    this.create = function (user) {
        // POST /api/user/:id
        _userService.post(user).then(function (response) {
            $rootScope.$broadcast('user.create');
        }, function (response) {
            switch (response.data.error) {
                case 332:
                    response.statusText = 'Password does not match';
                    $rootScope.$broadcast('user.failure', response.statusText);
                    break;
                default:
                    $rootScope.$broadcast('user.validationError', response.data.error);
                    break;
            }
        });
    };
    this.update_time_message = function (user_id) {
        // PUT /api/update_time_message/:id
        _userService.customPOST({}, "update_time_message", {user_id:user_id}, {}).then(function (response) {
        }, function (response) {
        });
    };


    /*
     * Update user (PUT)
     */
    this.update = function (user) {
        // PUT /api/user/:id
        user.put().then(function () {
            $rootScope.$broadcast('user.update');
            var $state = $injector.get("$state");
            $state.go('admin.users');
        }, function (response) {
            switch (response.status) {
                case 444:
                    response.statusText = 'You should select at least 1 permission';
                    $rootScope.$broadcast('user.validationError', response.statusText);
                    break;
                default:
                    $rootScope.$broadcast('user.validationError', response.data.error);
            }
        });
    };




    /*
     * Delete user
     * To delete multi record you should must use 'Restangular.several'
     */
    this.delete = function (selection) {
        // DELETE /api/user/:id
        Restangular.several('user', selection).remove().then(function () {
            $rootScope.$broadcast('user.delete');
        }, function (response) {
            $rootScope.$broadcast('user.not.delete');
        });
    };




    /*
     * Search in users
     */
    this.search = function (query, per_page) {
        // GET /api/user/search?query=test&per_page=10
        if (query != '') {
            return _userService.customGETLIST("search", {query: query, per_page: per_page});
        } else {
            return _userService.getList();
        }
    };

    this.show_profile = function (user_id) {
        if (user_id != '') {
            return _userService.customPOST({}, "show_profile", {'user_id': user_id}, {});
        }
    }


    /*
     * Download Exported File
     */
    this.downloadExport = function (recordType, selection, export_type) {
        _userService.withHttpConfig({responseType: 'blob'}).customGET('export/file', {
            record_type: recordType,
            export_type: export_type,
            'selection[]': selection
        }).then(function (response) {
            var url = (window.URL || window.webkitURL).createObjectURL(response);
            var anchor = document.createElement("a");
            document.body.appendChild(anchor);//required in FF, optional for Chrome
            anchor.download = "exportfile." + export_type;
            anchor.href = url;
            anchor.click();
        })
    };


    /*
     * Import Data From File
     */
    this.fetchFields = function (fileName) {
        return _userService.customPOST({importname: "fetch"}, 'import_excel_csv', {
            file_name: fileName,
            module_name: 'users'
        }, {});
    };
    //
    this.importData = function (mapform) {
        return _userService.customPOST({importname: "import"}, 'import_excel_csv_database', mapform, {});
    }


    var organizationUsers = [];
    this.addUser = function(newObj) {
        organizationUsers.push(newObj);
    };

    this.getOrganizationUsers = function(){
        return organizationUsers;
    };



});

