/**
 * UI-Router and Basic App Configuration
 */
'use strict';

app
    .run(function (WebSocketService, $rootScope, $localStorage, $sessionStorage, $state, $stateParams, $translate, tmhDynamicLocale, Restangular) {


        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        // translate refresh is necessary to load translate table
        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        });
        $rootScope.$on('mapInitialized', function (evt, map) {
            $rootScope.map = map;
            $rootScope.$apply();
        });
        $rootScope.$on('$translateChangeEnd', function () {
            // get current language
            $rootScope.currentLanguage = $translate.use();
            //dynamic load angularjs locale
            tmhDynamicLocale.set($rootScope.currentLanguage);
            // change direction to right-to-left language
            if ($rootScope.currentLanguage === 'ar-ae' || $rootScope.currentLanguage === 'fa-ir') {
                $rootScope.currentDirection = 'rtl';
            } else {
                $rootScope.currentDirection = 'ltr';
            }
            // set lang parameter for any request that with Restangular
            Restangular.setDefaultRequestParams({lang: $rootScope.currentLanguage});
        });
        $rootScope.previousState;
        $rootScope.currentState;
        $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
            $rootScope.previousState = from.name;
            $rootScope.currentState = to.name;
            if ($rootScope.currentState == "login") {
                if (WebSocketService.status()) {
                    WebSocketService.close_websocket_client_connection();
                }
            }
        });
    })
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $breadcrumbProvider, $authProvider, RestangularProvider, CacheFactoryProvider, $translateProvider, tmhDynamicLocaleProvider, NotificationProvider, $translatePartialLoaderProvider) {
        /**
         * Angular translate config
         */
        $translatePartialLoaderProvider.addPart('shared');
        $translateProvider
            .useMissingTranslationHandlerLog()
            .useSanitizeValueStrategy(null)// for prevent from XSS vulnerability but this has problem with utf-8 language
            .fallbackLanguage('en-us') //Registering a fallback language
            .registerAvailableLanguageKeys(['en-us', 'ca-es'], { // register your language key and browser key find
                'en_*': 'en-us',
                'ca_*': 'ca-es'
            })
            .useLoader('$translatePartialLoader', { // for lazy load we use this service
                urlTemplate: 'app/{part}/lang/locale_{lang}.json',// in this section we define our structure
                loadFailureHandler: 'MyErrorHandler'//it's a factory to error handling
            })
            .useLoaderCache(true)//use cache to loading translate file
            .useCookieStorage()// using cookie to keep current language
            //     .useMissingTranslationHandlerLog(); // you can remove in production
            //    .determinePreferredLanguage();// define language by browser language
            .preferredLanguage('en-us');

        /* angular locale dynamic load */
        tmhDynamicLocaleProvider.localeLocationPattern('app/assets/vendors/angularjs/js/i18n/angular-locale_{{locale}}.js');
        /**
         * Angular-ui-notification
         */
        NotificationProvider.setOptions({
            delay: 7000,
            startTop: 80,
            startRight: 10,
            verticalSpacing: 20,
            horizontalSpacing: 20,
            positionX: 'right',
            positionY: 'top'
        });
        /**
         * Angular-Cache basic configuration
         */
        //Cache will hold data in client memory. Data is cleared when the page is refreshed.
        angular.extend(CacheFactoryProvider.defaults, {
            maxAge: 5 * 60 * 1000, // 5 minutes
            deleteOnExpire: 'aggressive'
        });
        /**
         * Restangular API URL
         */
        RestangularProvider.setBaseUrl('../laravel-backend/public/api');
        /* force Restangular's getList to work with Laravel 5's pagination object  */
        RestangularProvider.addResponseInterceptor(parseApiResponse);
        function parseApiResponse(data, operation) {
            var response = data;
            if (operation === 'getList' && data.data) {
                response = data.data;
                response.metadata = _.omit(data, 'data');
            }
            return response;
        }

        /**
         *  ngAA Config
         */
        $authProvider.signinUrl = '../laravel-backend/public/api/authenticate';
        $authProvider.signinState = 'login';
        $authProvider.signinRoute = '/login';
        $authProvider.signinTemplateUrl = 'app/shared/views/login.html';
        $authProvider.afterSigninRedirectTo = 'admin.avls';
        $authProvider.afterSignoutRedirectTo = 'login';
        /**
         *  breadcrumb config
         */
        $breadcrumbProvider.setOptions({
            templateUrl: 'app/shared/views/ncyBreadcrumb.tpl.bs3.html',
            translations: true
        });
        /**
         * UI-Router config
         */
        // config prefix and unmatched route handler - UI-Router
        $urlRouterProvider.otherwise(function ($injector) {
            var $state = $injector.get("$state");
            $state.go('admin');
        });
        $stateProvider
            .state('admin', {
                url: '/admin',
                templateUrl: 'app/shared/views/admin.html',
                ncyBreadcrumb: {
                    label: 'app.breadcrumb.admin'// angular translate variable
                },
                data: {
                    authenticated: true
                },
                controller: 'AdminCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('shared');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'panel-flat',
                                'ui-bs-paging',
                                'jquery-ui-custom',
                                'momentjs',
                                'UserServiceModule',
                                'MessageServiceModule'
                            ]).then(
                                function () {
                                    return $ocLazyLoad.load(['app/shared/controllers/AdminCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.profile', {
                url: "/profile",
                templateUrl: "app/shared/views/profile.html",
                ncyBreadcrumb: {
                    label: 'Profile',
                    parent: 'admin'
                },
                controller: 'profileCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'momentjs',
                                'ui-bs-paging',
                                'dropzone',
                                'panel-flat',
                                'RoleServiceModule',
                                'OrganizationServiceModule',
                                'UserServiceModule',
                                'MessageServiceModule'
                            ]).then(
                                function () {
                                    return $ocLazyLoad.load(['app/shared/controllers/ProfileCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.chat', {
                url: "/chat",
                templateUrl: "app/shared/views/chat.html",
                ncyBreadcrumb: {
                    label: 'Chat',
                    parent: 'admin'
                },
                controller: 'chatCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'panel-flat',
                                'angular-scroll-glue',
                                'sweet-alert',
                                'bootstrap-iconpicker',
                                'ui-bs-paging',
                                'ui-select-filter',
                                'jquery-ui',
                                'ui-bootstrap',
                                'jasny-bootstrap',
                                'momentjs',
                                'RoleServiceModule',
                                'OrganizationServiceModule',
                                'UserServiceModule',
                                'MessageServiceModule',
                                'ConversationServiceModule'
                            ]).then(
                                function () {
                                    return $ocLazyLoad.load(['app/shared/controllers/ChatCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.dashboard', { // define nested route with ui-router with (.) dot
                url: "/dashboard",
                templateUrl: "app/shared/views/real-dashboard.html",
                ncyBreadcrumb: {
                    label: 'app.breadcrumb.dashboard',// angular translate variable
                    parent: 'admin'
                },
                data: {
                    permits: { //check for authenticity and permissions
                        withOnly: 'view_dashboard'
                    }
                },
                controller: 'DashboardCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['morrischart', 'sparkline', 'easypiechart', 'jquery-ui-custom']).then(
                                function () {
                                    return $ocLazyLoad.load(['panel-flat', 'fullcalendar', 'app/shared/controllers/DashboardCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('forget-password', {
                url: '/forget',
                templateUrl: 'app/shared/views/forget.html',
                controller: 'ForgetPassCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['sweet-alert', 'app/shared/controllers/ForgetPassCtrl.js']);
                        }]
                }
            })
            .state('reset-password', {
                url: '/forget/reset/:token',
                templateUrl: 'app/shared/views/reset.html',
                controller: 'ForgetPassCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['sweet-alert', 'app/shared/controllers/ForgetPassCtrl.js']);
                        }]
                }
            })
            /*Users*/
            .state('admin.users', {
                url: "/users",
                templateUrl: "app/modules/user/views/users.html",
                ncyBreadcrumb: {
                    label: 'app.breadcrumb.users',// angular translate variable
                    parent: 'admin'
                },
                data: {
                    permits: { //check for authenticity and permissions
                        withAny: ['view_user', 'delete_user']
                    }
                },
                controller: 'UserListCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/user');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['bootstrap-toggle',
                                'sweet-alert', 'ui-bs-paging', 'UserServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/user/controllers/UserListCtrl.js']);
                                }
                            );
                        }],
                    resolvedItems: ['dep', 'UserService',
                        function (dep, UserService) {
                            return UserService.cachedList().then(function (data) {
                                return data;
                            });
                        }]

                }
            })
            .state('admin.createUser', {
                url: "/users/new",
                templateUrl: "app/modules/user/views/userform.html",
                ncyBreadcrumb: {
                    label: 'app.breadcrumb.newUser',// angular translate variable
                    parent: 'admin.users'
                },
                data: {
                    permits: { //check for authenticity and permissions
                        withOnly: 'add_user'
                    }
                },
                controller: 'UserCreateCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/user');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'dropzone',
                                'ladda',
                                'bootstrap-iconpicker',
                                'sweet-alert',
                                'ui-bs-paging',
                                'ui-select-filter',
                                'select2',
                                'jquery-ui',
                                'ui-bootstrap',
                                'knob',
                                'angular-sc-select',
                                'angular-bootstrap-multiselect',
                                'jasny-bootstrap',
                                'angular-country-timezone',
                                'RoleServiceModule', 'OrganizationServiceModule', 'UserServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/user/controllers/UserCreateCtrl.js']);
                                }
                            );
                        }],
                    resolvedItems: ['dep', 'RoleService',
                        function (dep, RoleService) {
                            return RoleService.list().then(function (data) {
                                return data;
                            });
                        }]
                }
            })
            .state('admin.editUser', {
                url: "/users/:id/edit",
                templateUrl: "app/modules/user/views/userform.html",
                ncyBreadcrumb: {
                    label: 'app.breadcrumb.editUser',// angular translate variable
                    parent: 'admin.users'
                },
                data: {
                    permits: {
                        withOnly: 'edit_user'
                    }
                },
                controller: 'UserEditCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/user');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'dropzone',
                                'ladda',
                                'bootstrap-iconpicker',
                                'sweet-alert',
                                'ui-bs-paging',
                                'ui-select-filter',
                                'select2',
                                'jquery-ui',
                                'ui-bootstrap',
                                'knob',
                                'angular-sc-select',
                                'angular-bootstrap-multiselect',
                                'jasny-bootstrap',
                                'angular-country-timezone',
                                'RoleServiceModule', 'OrganizationServiceModule', 'UserServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/user/controllers/UserEditCtrl.js']);
                                }
                            );
                        }],
                    resolvedItems: ['dep', 'UserService', '$stateParams',
                        function (dep, UserService, $stateParams) {
                            return UserService.cachedShow($stateParams.id).then(function (data) {
                                return data;
                            });
                        }]
                }
            })
            .state('admin.importUser', {
                url: "/users/import",
                templateUrl: "app/modules/user/views/userimport.html",
                ncyBreadcrumb: {
                    label: 'app.breadcrumb.import',// angular translate variable
                    parent: 'admin.users'
                },
                data: {
                    permits: {
                        withOnly: 'import_user'
                    }
                },
                controller: 'UserImportCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/user');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['dropzone', 'sweet-alert', 'RoleServiceModule', 'UserServiceModule', 'angular-wizard']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/user/controllers/UserImportCtrl.js']);
                                }
                            );
                        }]
                }
            })
            /*Roles*/
            .state('admin.roles', {
                url: "/roles",
                templateUrl: "app/modules/role/views/roles.html",
                ncyBreadcrumb: {
                    label: 'app.breadcrumb.roles',// angular translate variable
                    parent: 'admin'
                },
                data: {
                    permits: { //check for authenticity and permissions
                        withAny: ['view_role', 'delete_role']
                    }
                },
                controller: 'RoleListCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/role');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['sweet-alert', 'ui-bs-paging', 'RoleServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/role/controllers/RoleListCtrl.js']);
                                }
                            );
                        }],
                    resolvedItems: ['dep', 'RoleService',
                        function (dep, RoleService) {
                            return RoleService.cachedList().then(function (data) {
                                return data;
                            });
                        }]
                }
            })
            .state('admin.createRole', {
                url: "/roles/new",
                templateUrl: "app/modules/role/views/roleform.html",
                ncyBreadcrumb: {
                    label: 'app.breadcrumb.newRole',// angular translate variable
                    parent: 'admin.roles'
                },
                data: {
                    permits: {
                        withOnly: 'add_role'
                    }
                },
                controller: 'RoleCreateCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/role');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['PermissionServiceModule', 'RoleServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/role/controllers/RoleCreateCtrl.js']);
                                }
                            );
                        }],
                    resolvedItems: ['dep', 'PermissionService',
                        function (dep, PermissionService) {
                            return PermissionService.all().then(function (data) {
                                return data;
                            });
                        }]
                }
            })
            .state('admin.editRole', {
                url: "/roles/:id/edit",
                templateUrl: "app/modules/role/views/roleform.html",
                ncyBreadcrumb: {
                    label: 'app.breadcrumb.editRole',// angular translate variable
                    parent: 'admin.roles'
                },
                data: {
                    permits: {
                        withOnly: 'edit_role'
                    }
                },
                controller: 'RoleEditCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/role');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['RoleServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/role/controllers/RoleEditCtrl.js']);
                                }
                            );
                        }],
                    resolvedItems: ['dep', 'RoleService', '$stateParams',
                        function (dep, RoleService, $stateParams) {
                            return RoleService.cachedShow($stateParams.id).then(function (data) {
                                return data;
                            });
                        }]
                }
            })
            /*Permissions*/
            .state('admin.permissions', {
                url: "/permissions",
                templateUrl: "app/modules/permission/views/permissions.html",
                ncyBreadcrumb: {
                    label: 'app.breadcrumb.permissions',// angular translate variable
                    parent: 'admin'
                },
                data: {
                    permits: {
                        withAny: ['view_permission', 'delete_permission']
                    }
                },
                controller: 'PermissionListCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/permission');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['ui-bs-paging', 'PermissionServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/permission/controllers/PermissionListCtrl.js']);
                                }
                            );
                        }],
                    resolvedItems: ['dep', 'PermissionService',
                        function (dep, PermissionService) {
                            return PermissionService.cachedList().then(function (data) {
                                return data;
                            });
                        }]
                }
            })
            .state('admin.createPermission', {
                url: "/permissions/new",
                templateUrl: "app/modules/permission/views/permissionform.html",
                ncyBreadcrumb: {
                    label: 'app.breadcrumb.newPermission',// angular translate variable
                    parent: 'admin.permissions'
                },
                data: {
                    permits: {
                        withOnly: 'add_permission'
                    }
                },
                controller: 'PermissionCreateCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/permission');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['sweet-alert', 'ui-bs-paging', 'PermissionServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/permission/controllers/PermissionCreateCtrl.js']);
                                }
                            );
                        }]
                }
            })
            /*Tasks*/
            .state('admin.tasks', {
                url: "/tasks",
                templateUrl: "app/modules/task/views/tasks.html",
                ncyBreadcrumb: {
                    label: 'app.breadcrumb.tasks',// angular translate variable
                    parent: 'admin'
                },
                data: {
                    permits: {
                        withAny: ['view_task', 'delete_task']
                    }
                },
                controller: 'TaskListCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/task');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['sweet-alert', 'ui-bs-paging', 'TaskServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load('app/modules/task/controllers/TaskListCtrl.js');
                                }
                            );
                        }],
                    resolvedItems: ['dep', 'TaskService',
                        function (dep, TaskService) {
                            return TaskService.cachedList().then(function (data) {
                                return data;
                            });
                        }]
                }
            })
            .state('admin.createTask', {
                url: "/tasks/new",
                templateUrl: "app/modules/task/views/taskform.html",
                ncyBreadcrumb: {
                    label: 'app.breadcrumb.newTask',// angular translate variable
                    parent: 'admin.tasks'
                },
                data: {
                    permits: {
                        withOnly: 'add_task'
                    }
                },
                controller: 'TaskCreateCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/task');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['TagServiceModule', 'CategoryServiceModule', 'UserServiceModule', 'TaskServiceModule', 'ui-select-filter', 'dropzone', 'summernote', 'select2']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/task/controllers/TaskCreateCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.editTask', {
                url: "/tasks/:id/edit",
                templateUrl: "app/modules/task/views/taskform.html",
                ncyBreadcrumb: {
                    label: 'app.breadcrumb.editTask',// angular translate variable
                    parent: 'admin.tasks'
                },
                data: {
                    permits: {
                        withOnly: 'edit_task'
                    }
                },
                controller: 'TaskEditCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/task');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['summernote', 'select2', 'TagServiceModule', 'CategoryServiceModule', 'UserServiceModule', 'TaskServiceModule', 'ui-select-filter', 'dropzone']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/task/controllers/TaskEditCtrl.js']);
                                }
                            );
                        }],
                    resolvedItems: ['dep', 'TaskService', '$stateParams',
                        function (dep, TaskService, $stateParams) {
                            return TaskService.cachedShow($stateParams.id).then(function (data) {
                                return data;
                            });
                        }]
                }
            })
            .state('admin.viewTask', {
                url: "/tasks/:id/view",
                templateUrl: "app/modules/task/views/taskview.html",
                ncyBreadcrumb: {
                    label: 'app.breadcrumb.taskView',// angular translate variable
                    parent: 'admin.tasks'
                },
                data: {
                    permits: {
                        withOnly: 'view_task'
                    }
                },
                controller: 'TaskViewCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/task');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['summernote', 'select2', 'TagServiceModule', 'CategoryServiceModule', 'UserServiceModule', 'TaskServiceModule', 'ui-select-filter', 'dropzone', 'fancybox-plus', 'CommentServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/task/controllers/TaskViewCtrl.js']);
                                }
                            );
                        }],
                    resolvedItems: ['dep', 'TaskService', '$stateParams',
                        function (dep, TaskService, $stateParams) {
                            return TaskService.cachedShow($stateParams.id).then(function (data) {
                                return data;
                            });
                        }]
                }
            })
            .state('admin.categories', {
                url: "/categories",
                templateUrl: "app/modules/category/views/categories.html",
                ncyBreadcrumb: {
                    label: 'app.breadcrumb.categories',// angular translate variable
                    parent: 'admin'
                },
                data: {
                    permits: {
                        withAny: ['view_category', 'delete_category', 'add_category', 'edit_category']
                    }
                },
                controller: 'CategoryCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/category');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['summernote', 'sweet-alert', 'CategoryServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/category/controllers/CategoryCtrl.js']);
                                }
                            );
                        }],
                    resolvedItems: ['dep', 'CategoryService',
                        function (dep, CategoryService) {
                            return CategoryService.cachedList().then(function (data) {
                                return data;
                            });
                        }]
                }
            })
            /*Organizations*/
            .state('admin.organizations', {
                url: "/organizations",
                templateUrl: "app/modules/organization/views/organizations.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.organizations',
                    parent: 'admin'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withAny: ['view_organization', 'delete_organization']
                    }
                },
                controller: 'OrganizationListCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/organization');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'bootstrap-toggle',
                                'ladda',
                                'bootstrap-iconpicker',
                                'summernote',
                                'sweet-alert',
                                'ui-bs-paging',
                                'SubOrganizationServiceModule',
                                'OrganizationServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/vendors/angular-ladda/angular-ladda.min.js', 'app/modules/organization/controllers/OrganizationListCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.createOrganization', {
                url: "/organizations/new",
                templateUrl: "app/modules/organization/views/organizationform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.organizations_create',
                    parent: 'admin.organizations'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'add_organization'
                    }
                },
                controller: 'OrganizationCreateCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/organization');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['dropzone', 'jasny-bootstrap', 'google-map', 'OrganizationServiceModule', 'SubOrganizationServiceModule', 'select2', 'ui-bootstrap', 'momentx-edit', 'jasny-bootstrap', 'knob', 'bootstrap-tagsinput']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/organization/controllers/OrganizationCreateCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.viewOrganization', {
                url: "/organizations/:id/view",
                templateUrl: "app/modules/organization/views/view-form.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.organizations_view',
                    parent: 'admin.organizations'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'view_organization'
                    }
                },
                controller: 'OrganizationViewCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/organization');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['OrganizationServiceModule', 'SubOrganizationServiceModule', 'bootstrap-tagsinput', 'jasny-bootstrap', 'knob', 'ladda', 'bootstrap-iconpicker', 'summernote', 'ui-bs-paging']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/organization/controllers/OrganizationViewCtrl.js'])
                                }
                            )
                        }]
                }
            })
            .state('admin.editOrganization', {
                url: "/organizations/:id/edit",
                templateUrl: "app/modules/organization/views/edit-form.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.organizations_edit',
                    parent: 'admin.organizations'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'edit_organization'
                    }
                },
                controller: 'OrganizationEditCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/organization');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['OrganizationServiceModule', 'SubOrganizationServiceModule', 'select2', 'ui-bootstrap', 'momentx-edit', 'jasny-bootstrap', 'knob', 'bootstrap-tagsinput']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/organization/controllers/OrganizationEditCtrl.js'])
                                }
                            )
                        }]
                }
            })
            /*Resources*/
            .state('admin.assetsresources', {
                url: "/assetsresources",
                templateUrl: "app/modules/assetsresource/views/assetsresources.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.assetsresources',
                    parent: 'admin'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withAny: ['view_assetsresource', 'delete_assetsresource']
                    }
                },
                controller: 'AssetsResourceListCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetsresource');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'google-map',
                                'bootstrap-toggle',
                                'sweet-alert',
                                'ui-bs-paging',
                                'ladda',
                                'bootstrap-iconpicker',
                                'summernote',
                                'AssetsPersonServiceModule',
                                'AssetsVehicleServiceModule',
                                'AssetsResourceServiceModule',
                                'PointServiceModule'
                            ]).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetsresource/controllers/AssetsResourceListCtrl.js', 'app/vendors/angular-ladda/angular-ladda.min.js']);
                                }
                            );
                        }]


                }
            })
            .state('admin.createAssetsResource', {
                url: "/assetsresources/new",
                templateUrl: "app/modules/assetsresource/views/assetsresourceform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.assetsresources_create',
                    parent: 'admin.assetsresources'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'add_assetsresource'
                    }
                },
                controller: 'AssetsResourceCreateCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetsresource');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'ladda',
                                'bootstrap-iconpicker',
                                'summernote',
                                'sweet-alert',
                                'ui-bs-paging',
                                'ui-select-filter',
                                'select2',
                                'jquery-ui',
                                'ui-bootstrap',
                                'jasny-bootstrap',
                                'knob',
                                'angular-sc-select',
                                'angular-bootstrap-multiselect',
                                'AssetsCategoryServiceModule',
                                'OrganizationServiceModule',
                                'AssetsResourceServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetsresource/controllers/AssetsResourceCreateCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.viewAssetsResource', {
                url: "/assetsresources/:id/view",
                templateUrl: "app/modules/assetsresource/views/assetsresourceform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.assetsresources_view',
                    parent: 'admin.assetsresources'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'view_assetsresource'
                    }
                },
                controller: 'AssetsResourceViewCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetsresource');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'ui-select-filter',
                                'dropzone',
                                'summernote',
                                'select2',
                                'jquery-ui',
                                'google-map',
                                'ui-bs-paging',
                                'select2',
                                'ui-bootstrap',
                                'momentx-edit',
                                'jasny-bootstrap',
                                'knob',
                                'angular-sc-select',
                                'angular-bootstrap-multiselect',
                                'AssetsResourceServiceModule', 'OrganizationServiceModule', 'AssetsCategoryServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetsresource/controllers/AssetsResourceViewCtrl.js'])
                                }
                            )
                        }]
                }
            })
            .state('admin.editAssetsResource', {
                url: "/assetsresources/:id/edit",
                templateUrl: "app/modules/assetsresource/views/assetsresourceform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.assetsresources_edit',
                    parent: 'admin.assetsresources'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'edit_assetsresource'
                    }
                },
                controller: 'AssetsResourceEditCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetsresource');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'ui-select-filter',
                                'dropzone',
                                'summernote',
                                'select2',
                                'jquery-ui',
                                'google-map',
                                'ui-bs-paging',
                                'select2',
                                'ui-bootstrap',
                                'momentx-edit',
                                'jasny-bootstrap',
                                'knob',
                                'angular-sc-select',
                                'angular-bootstrap-multiselect',
                                'AssetsResourceServiceModule', 'OrganizationServiceModule', 'AssetsCategoryServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetsresource/controllers/AssetsResourceEditCtrl.js'])
                                }
                            )
                        }]
                }
            })
            /*Vehicles*/
            .state('admin.assetsvehicles', {
                url: "/assetsvehicles",
                templateUrl: "app/modules/assetsvehicle/views/assetsvehicles.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.vehicles',
                    parent: 'admin'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withAny: ['view_assetsvehicle', 'delete_assetsvehicle']
                    }
                },
                controller: 'AssetsVehicleListCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetsvehicle');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'google-map',
                                'sweet-alert',
                                'bootstrap-toggle',
                                'ui-bs-paging',
                                'ladda',
                                'lazy-multiselect-io-select',
                                'OrganizationServiceModule',
                                'AvlServiceModule',
                                'ui-select-filter',
                                'select2',
                                'jquery-ui',
                                'sweet-alert',
                                'google-map',
                                'ui-bs-paging',
                                'select2',
                                'ui-bootstrap',
                                'jasny-bootstrap',
                                'knob',
                                'bootstrap-tagsinput',
                                'angular-sc-select',
                                'angular-bootstrap-multiselect',
                                'my-custom-angular-daterange',
                                'AssetsResourceRelationServiceModule',
                                'AssetsVehicleServiceModule',
                                'OrganizationServiceModule',
                                'AssetsResourceServiceModule',
                                'AssetsCategoryServiceModule',
                                'PointServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetsvehicle/controllers/AssetsVehicleListCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.createAssetsVehicle', {
                url: "/assetsvehicles/new",
                templateUrl: "app/modules/assetsvehicle/views/assetsvehicleform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.assetsvehicles_create',
                    parent: 'admin.assetsvehicles'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'add_assetsvehicle'
                    }
                },
                controller: 'AssetsVehicleCreateCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetsvehicle');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'ui-select-filter',
                                'select2',
                                'jquery-ui',
                                'ui-bs-paging',
                                'ui-bootstrap',
                                'knob',
                                'angular-sc-select',
                                'angular-bootstrap-multiselect',
                                'jasny-bootstrap',
                                'bootstrap-tagsinput',
                                'AssetsVehicleServiceModule',
                                'AssetsResourceServiceModule',
                                'OrganizationServiceModule',
                                'AssetsCategoryServiceModule',
                                'PointServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetsvehicle/controllers/AssetsVehicleCreateCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.viewAssetsVehicle', {
                url: "/assetsvehicles/:id/view",
                templateUrl: "app/modules/assetsvehicle/views/assetsvehicleform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.assetsvehicles_view',
                    parent: 'admin.assetsvehicles'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'view_assetsvehicle'
                    }
                },
                controller: 'AssetsVehicleViewCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetsvehicle');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'ui-select-filter',
                                'dropzone',
                                'jquery-ui',
                                'ui-bootstrap',
                                'knob',
                                'angular-sc-select',
                                'angular-bootstrap-multiselect',
                                'select2',
                                'jasny-bootstrap',
                                'bootstrap-tagsinput',
                                'AssetsVehicleServiceModule',
                                'OrganizationServiceModule',
                                'AssetsResourceServiceModule',
                                'AssetsResourceRelationServiceModule',
                                'AssetsCategoryServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetsvehicle/controllers/AssetsVehicleViewCtrl.js'])
                                }
                            )
                        }]
                }
            })
            .state('admin.editAssetsVehicle', {
                url: "/assetsvehicles/:id/edit",
                templateUrl: "app/modules/assetsvehicle/views/assetsvehicleform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.assetsvehicles_edit',
                    parent: 'admin.assetsvehicles'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'edit_assetsvehicle'
                    }
                },
                controller: 'AssetsVehicleEditCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetsvehicle');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'ui-select-filter',
                                'dropzone',
                                'jquery-ui',
                                'ui-bootstrap',
                                'jasny-bootstrap',
                                'knob',
                                'select2',
                                'bootstrap-tagsinput',
                                'angular-sc-select',
                                'angular-bootstrap-multiselect',
                                'AssetsVehicleServiceModule',
                                'OrganizationServiceModule',
                                'AssetsResourceServiceModule',
                                'AssetsResourceRelationServiceModule',
                                'AssetsCategoryServiceModule',
                                'PointServiceModule'
                            ]).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetsvehicle/controllers/AssetsVehicleEditCtrl.js'])
                                }
                            )
                        }]
                }
            })
            /*Persons*/
            .state('admin.assetspersons', {
                url: "/assetspersons",
                templateUrl: "app/modules/assetsperson/views/assetspersons.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.assetspersons',
                    parent: 'admin'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withAny: ['view_assetsperson', 'delete_assetsperson']
                    }
                },
                controller: 'AssetsPersonListCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetsperson');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'google-map',
                                'bootstrap-toggle',
                                'sweet-alert',
                                'ui-bs-paging',
                                'AssetsPersonServiceModule',
                                'ladda',
                                'ladda',
                                'lazy-multiselect-io-select',
                                'momentjs',
                                'OrganizationServiceModule',
                                'AvlServiceModule',
                                'ui-select-filter',
                                'select2',
                                'jquery-ui',
                                'sweet-alert',
                                'google-map',
                                'ui-bs-paging',
                                'select2',
                                'ui-bootstrap',
                                'jasny-bootstrap',
                                'knob',
                                'bootstrap-tagsinput',
                                'angular-sc-select',
                                'angular-bootstrap-multiselect',
                                'my-angular-daterange',
                                'my-custom-angular-daterange',
                                'AssetsResourceRelationServiceModule',
                                'PointServiceModule',
                                'bootstrap-iconpicker',
                                'summernote']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetsperson/controllers/AssetsPersonListCtrl.js', 'app/vendors/angular-ladda/angular-ladda.min.js']);
                                }
                            );
                        }]


                }
            })
            .state('admin.createAssetsPerson', {
                url: "/assetspersons/new",
                templateUrl: "app/modules/assetsperson/views/assetspersonform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.assetspersons_create',
                    parent: 'admin.assetspersons'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'add_assetsperson'
                    }
                },
                controller: 'AssetsPersonCreateCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetsperson');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'dropzone',
                                'jasny-bootstrap',
                                'fuelux',
                                'jquery.steps',
                                'jquery.validate',
                                'jquery-ui',
                                'sweet-alert',
                                'knob',
                                'angular-bootstrap-multiselect',
                                'select2',
                                'ui-select-filter',
                                'ui-bs-paging',
                                'ui-bootstrap',
                                'angular-sc-select',
                                'bootstrap-tagsinput',
                                'google-map',
                                'AssetsCategoryServiceModule',
                                'AssetsResourceServiceModule',
                                'OrganizationServiceModule',
                                'AssetsPersonServiceModule',
                                'PointServiceModule'
                            ]).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetsperson/controllers/AssetsPersonCreateCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.viewAssetsPerson', {
                url: "/assetspersons/:id/view",
                templateUrl: "app/modules/assetsperson/views/assetspersonform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.assetspersons_view',
                    parent: 'admin.assetspersons'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'view_assetsperson'
                    }
                },
                controller: 'AssetsPersonViewCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetsperson');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'dropzone',
                                'jasny-bootstrap',
                                'fuelux',
                                'jquery.steps',
                                'jquery.validate',
                                'jquery-ui',
                                'sweet-alert',
                                'knob',
                                'angular-bootstrap-multiselect',
                                'select2',
                                'ui-select-filter',
                                'ui-bs-paging',
                                'ui-bootstrap',
                                'angular-sc-select',
                                'bootstrap-tagsinput',
                                'google-map',
                                'AssetsCategoryServiceModule',
                                'AssetsResourceServiceModule',
                                'AssetsResourceRelationServiceModule',
                                'OrganizationServiceModule',
                                'AssetsPersonServiceModule',
                                'PointServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetsperson/controllers/AssetsPersonViewCtrl.js'])
                                }
                            )
                        }]
                }
            })
            .state('admin.editAssetsPerson', {
                url: "/assetspersons/:id/edit",
                templateUrl: "app/modules/assetsperson/views/assetspersonform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.assetspersons_edit',
                    parent: 'admin.assetspersons'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'edit_assetsperson'
                    }
                },
                controller: 'AssetsPersonEditCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetsperson');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'dropzone',
                                'jasny-bootstrap',
                                'fuelux',
                                'jquery.steps',
                                'jquery.validate',
                                'jquery-ui',
                                'sweet-alert',
                                'knob',
                                'angular-bootstrap-multiselect',
                                'select2',
                                'ui-select-filter',
                                'ui-bs-paging',
                                'ui-bootstrap',
                                'angular-sc-select',
                                'bootstrap-tagsinput',
                                'google-map',
                                'AssetsCategoryServiceModule',
                                'AssetsResourceServiceModule',
                                'AssetsResourceRelationServiceModule',
                                'OrganizationServiceModule',
                                'AssetsPersonServiceModule',
                                'PointServiceModule'
                            ]).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetsperson/controllers/AssetsPersonEditCtrl.js'])
                                }
                            )
                        }]
                }
            })
            /***************************************************
             * This is assetsgroup and you can use it for your module
             ***************************************************/
            .state('admin.assetsgroups', {
                url: "/assetsgroups",
                templateUrl: "app/modules/assetsgroup/views/assetsgroups.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.assetsgroups',
                    parent: 'admin'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withAny: ['view_assetsgroup', 'delete_assetsgroup']
                    }
                },
                controller: 'AssetsGroupListCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetsgroup');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'bootstrap-toggle',
                                'ladda',
                                'bootstrap-iconpicker',
                                'summernote',
                                'sweet-alert',
                                'angular-filter',
                                'ui-bs-paging',
                                'AssetsGroupServiceModule',
                                'AssetsGroupDetailsServiceModule',
                                'WatcherGroupServiceModule'
                            ]).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetsgroup/controllers/AssetsGroupListCtrl.js', 'app/vendors/angular-ladda/angular-ladda.min.js']);
                                }
                            );
                        }]

                }
            })
            .state('admin.createAssetsGroup', {
                url: "/assetsgroups/new",
                templateUrl: "app/modules/assetsgroup/views/assetsgroupform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.assetsgroups_create',
                    parent: 'admin.assetsgroups'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'add_assetsgroup'
                    }
                },
                controller: 'AssetsGroupCreateCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetsgroup');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'dual-list',
                                'dropzone',
                                'jasny-bootstrap',
                                'ladda',
                                'bootstrap-iconpicker',
                                'summernote',
                                'sweet-alert',
                                'ui-bs-paging',
                                'ui-select-filter',
                                'select2',
                                'jquery-ui',
                                'ui-bootstrap',
                                'knob',
                                'angular-sc-select',
                                'angular-bootstrap-multiselect',
                                'WatcherGroupServiceModule',
                                'AssetsGroupServiceModule',
                                'AssetsPersonServiceModule',
                                'OrganizationServiceModule',
                                'UserServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetsgroup/controllers/AssetsGroupCreateCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.viewAssetsGroup', {
                url: "/assetsgroups/:id/view",
                templateUrl: "app/modules/assetsgroup/views/assetsgroupform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.assetsgroups_view',
                    parent: 'admin.assetsgroups'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'view_assetsgroup'
                    }
                },
                controller: 'AssetsGroupViewCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetsgroup');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'dual-list',
                                'dropzone',
                                'jasny-bootstrap',
                                'WatcherGroupServiceModule',
                                'AssetsGroupServiceModule',
                                'AssetsPersonServiceModule',
                                'OrganizationServiceModule',
                                'UserServiceModule',
                                'AssetsGroupDetailsServiceModule',
                                'jasny-bootstrap',
                                'ladda',
                                'bootstrap-iconpicker',
                                'summernote',
                                'sweet-alert',
                                'ui-bs-paging',
                                'ui-select-filter',
                                'select2',
                                'jquery-ui',
                                'ui-bootstrap',
                                'knob',
                                'angular-sc-select',
                                'angular-bootstrap-multiselect',
                                'WatcherGroupServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetsgroup/controllers/AssetsGroupViewCtrl.js'])
                                }
                            )
                        }]
                }
            })
            .state('admin.editAssetsGroup', {
                url: "/assetsgroups/:id/edit",
                templateUrl: "app/modules/assetsgroup/views/assetsgroupform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.assetsgroups_edit',
                    parent: 'admin.assetsgroups'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'edit_assetsgroup'
                    }
                },
                controller: 'AssetsGroupEditCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetsgroup');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'dual-list',
                                'dropzone',
                                'jasny-bootstrap',
                                'ladda',
                                'bootstrap-iconpicker',
                                'summernote',
                                'sweet-alert',
                                'ui-bs-paging',
                                'ui-select-filter',
                                'select2',
                                'jquery-ui',
                                'ui-bootstrap',
                                'knob',
                                'angular-sc-select',
                                'angular-bootstrap-multiselect',
                                'jasny-bootstrap',
                                'WatcherGroupServiceModule',
                                'AssetsGroupServiceModule',
                                'AssetsPersonServiceModule',
                                'OrganizationServiceModule',
                                'UserServiceModule',
                                'AssetsGroupDetailsServiceModule',
                                'WatcherGroupServiceModule'
                            ]).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetsgroup/controllers/AssetsGroupEditCtrl.js'])
                                }
                            )
                        }]
                }
            })
            /***************************************************
             * This is assetsgroupdetail and you can use it for your module
             ***************************************************/
            .state('admin.assetsgroupdetails', {
                url: "/assetsgroupdetails",
                templateUrl: "app/modules/assetsgroupdetail/views/assetsgroupdetails.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.assetsgroupdetails',
                    parent: 'admin'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withAny: ['view_assets_groups_details', 'delete_assets_groups_details']
                    }
                },
                controller: 'AssetsGroupDetailsListCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetsgroupdetail');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'ladda',
                                'bootstrap-iconpicker',
                                'summernote',
                                'angular-filter',
                                'sweet-alert',
                                'ui-bs-paging',
                                'GroupDetailsServiceModule',
                                'AssetsPersonServiceModule',
                                'AssetsResourceServiceModule',
                                'AssetsVehicleServiceModule',
                                'OrganizationServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetsgroupdetail/controllers/AssetsGroupDetailsListCtrl.js', 'app/vendors/angular-ladda/angular-ladda.min.js']);
                                }
                            );
                        }]


                }
            })
            .state('admin.createAssetsGroupDetails', {
                url: "/assetsgroupdetail/new",
                templateUrl: "app/modules/assetsgroupdetail/views/assetsgroupdetailsform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.assetsgroupdetails_create',
                    parent: 'admin.assetsgroupdetails'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'add_assets_groups_details'
                    }
                },
                controller: 'AssetsGroupDetailsCreateCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetsgroupdetail');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'dual-list',
                                'dropzone',
                                'jasny-bootstrap',
                                'WatcherGroupServiceModule',
                                'AssetsGroupServiceModule',
                                'GroupDetailsServiceModule', 'AssetsPersonServiceModule', 'OrganizationServiceModule', 'UserServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetsgroupdetail/controllers/AssetsGroupDetailsCreateCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.viewAssetsGroupDetails', {
                url: "/assetsgroupdetail/:id/view",
                templateUrl: "app/modules/assetsgroupdetail/views/assetsgroupdetails.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.assetsgroupdetails_view',
                    parent: 'admin.assetsgroupdetails'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'view_assets_groups_details'
                    }
                },
                controller: 'AssetsGroupViewCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetsgroupdetail');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['GroupDetailsServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetsgroup/controllers/AssetsGroupViewCtrl.js'])
                                }
                            )
                        }]
                }
            })
            .state('admin.editAssetsGroupDetails', {
                url: "/assetsgroupdetail/:id/edit",
                templateUrl: "app/modules/assetsgroupdetail/views/assetsgroupdetails.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.assetsgroupdetails_edit',
                    parent: 'admin.assetsgroupdetails'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'edit_assets_groups_details'
                    }
                },
                controller: 'AssetsGroupDetailsEditCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetsgroupdetail');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['GroupDetailsServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetsgroupdetail/controllers/AssetsGroupDetailsEditCtrl.js'])
                                }
                            )
                        }]
                }
            })
            /***************************************************
             * This is AssetsCategory and you can use it for your module
             ***************************************************/
            .state('admin.assetscategories', {
                url: "/assetscategories",
                templateUrl: "app/modules/assetscategory/views/assetscategories.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.categories',
                    parent: 'admin'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withAny: ['view_assetscategory', 'delete_assetscategory']
                    }
                },
                controller: 'AssetsCategoryListCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetscategory');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['sweet-alert', 'ui-bs-paging', 'AssetsCategoryServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetscategory/controllers/AssetsCategoryListCtrl.js', 'app/vendors/angular-ladda/angular-ladda.min.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.createAssetsCategory', {
                url: "/assetscategory/new",
                templateUrl: "app/modules/assetscategory/views/assetscategoryform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.categories_new',
                    parent: 'admin.assetscategories'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'add_assetscategory'
                    }
                },
                controller: 'AssetsCategoryCreateCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetscategory');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['dropzone', 'jasny-bootstrap', 'AssetsCategoryServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetscategory/controllers/AssetsCategoryCreateCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.viewAssetsCategory', {
                url: "/assetscategory/:id/view",
                templateUrl: "app/modules/assetscategory/views/assetscategoryform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.categories_view',
                    parent: 'admin.assetscategories'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'view_assetscategory'
                    }
                },
                controller: 'AssetsCategoryViewCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetscategory');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['AssetsCategoryServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetscategory/controllers/AssetsCategoryViewCtrl.js'])
                                }
                            )
                        }]
                }
            })
            .state('admin.editAssetsCategory', {
                url: "/assetscategory/:id/edit",
                templateUrl: "app/modules/assetscategory/views/assetscategoryform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.categories_edit',
                    parent: 'admin.assetscategories'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'edit_assetscategory'
                    }
                },
                controller: 'AssetsCategoryEditCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/assetscategory');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['AssetsCategoryServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/assetscategory/controllers/AssetsCategoryEditCtrl.js'])
                                }
                            )
                        }]
                }
            })
            /***************************************************
             * This is WatcherGroup and you can use it for your module
             ***************************************************/
            .state('admin.watchergroups', {
                url: "/watchergroup",
                templateUrl: "app/modules/watchergroup/views/watchergroups.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.watchergroup',
                    parent: 'admin'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withAny: ['view_watchergroup', 'delete_watchergroup']
                    }
                },
                controller: 'GroupWatcherListCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/watchergroup');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['sweet-alert', 'ui-bs-paging', 'WatcherGroupServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/watchergroup/controllers/GroupWatcherListCtrl.js', 'app/vendors/angular-ladda/angular-ladda.min.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.createWatcherGroup', {
                url: "/watchergroup/new",
                templateUrl: "app/modules/watchergroup/views/watchergroupform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.watchergroup_create',
                    parent: 'admin.watchergroups'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'add_watchergroup'
                    }
                },
                controller: 'WatcherGroupCreateCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/watchergroup');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['dropzone', 'jasny-bootstrap', 'WatcherGroupServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/watchergroup/controllers/WatcherGroupCreateCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.viewWatcherGroup', {
                url: "/watchergroup/:id/view",
                templateUrl: "app/modules/watchergroup/views/watchergroupform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.watchergroup_view',
                    parent: 'admin.watchergroups'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'view_watchergroup'
                    }
                },
                controller: 'WatcherGroupViewCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/watchergroup');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['AssetsCategoryServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/watchergroup/controllers/WatcherGroupViewCtrl.js'])
                                }
                            )
                        }]
                }
            })
            .state('admin.editWatcherGroup', {
                url: "/watchergroup/:id/edit",
                templateUrl: "app/modules/watchergroup/views/watchergroupform.html",
                ncyBreadcrumb: {
                    label: 'Edit Watchers Group',
                    parent: 'admin.watchergroups'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'edit_watchergroup'
                    }
                },
                controller: 'WatcherGroupEditCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/watchergroup');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['WatcherGroupServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/watchergroup/controllers/WatcherGroupEditCtrl.js'])
                                }
                            )
                        }]
                }
            })
            /*Points*/
            .state('admin.points', {
                url: "/points",
                templateUrl: "app/modules/point/views/points.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.points',
                    parent: 'admin'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withAny: ['view_point', 'delete_point']
                    }
                },
                controller: 'PointListCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/point');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'bootstrap-toggle',
                                'google-map',
                                'sweet-alert',
                                'jquery-ui',
                                'ui-bootstrap',
                                'jasny-bootstrap',
                                'ui-bs-paging', 'PointServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/point/controllers/PointListCtrl.js', 'app/vendors/angular-ladda/angular-ladda.min.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.createPoint', {
                url: "/points/new",
                templateUrl: "app/modules/point/views/pointform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.points_create',
                    parent: 'admin.points'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'add_point'
                    }
                },
                controller: 'PointCreateCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/point');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['dropzone', 'google-map', 'jasny-bootstrap', 'PointServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/point/controllers/PointCreateCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.viewPoint', {
                url: "/points/:id/view",
                templateUrl: "app/modules/point/views/pointform.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.points_view',
                    parent: 'admin.points'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'view_point'
                    }
                },
                controller: 'PointViewCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/point');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['google-map', 'PointServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/point/controllers/PointViewCtrl.js'])
                                }
                            )
                        }]
                }
            })
            .state('admin.editPoint', {
                url: "/points/:id/edit",
                templateUrl: "app/modules/point/views/edit-form.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.points_edit',
                    parent: 'admin.points'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'edit_point'
                    }
                },
                controller: 'PointEditCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/point');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['google-map', 'PointServiceModule']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/point/controllers/PointEditCtrl.js'])
                                }
                            )
                        }]
                }
            })
            /* AVLs */
            .state('admin.avls', {
                url: "/avls",
                templateUrl: "app/modules/avl/views/avls.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.avls',
                    parent: 'admin'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withAny: ['view_avl', 'delete_avl']
                    }
                },
                controller: 'AvlListCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/avl');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'google-map',
                                'jquery-ui',
                                'jquery-ui-custom',
                                'ui-bootstrap',
                                'jasny-bootstrap',
                                'bootstrap-iconpicker',
                                'select2',
                                'panel-flat',
                                'angular-sc-select',
                                'angular-bootstrap-multiselect',
                                'my-angular-daterange',
                                'my-custom-angular-daterange',
                                'ui-select-filter',
                                'knob',
                                'sweet-alert',
                                'ui-bs-paging',
                                'angular-scroll-glue',
                                'momentjs',
                                'OrganizationServiceModule',
                                'AvlServiceModule',
                                'AssetsCategoryServiceModule',
                                'AssetsVehicleServiceModule',
                                'AssetsResourceRelationServiceModule',
                                'AssetsPersonServiceModule',
                                'UserServiceModule'
                            ]).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/avl/controllers/AvlListCtrl.js', 'app/vendors/angular-ladda/angular-ladda.min.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.viewAvl', {
                url: "/avls/:id/view",
                templateUrl: "app/modules/avl/views/avls.html",
                ncyBreadcrumb: {
                    label: 'app.shared.admin.menu.avls_view',
                    parent: 'admin.avls'
                },
                data: {
                    permits: { // this permissions not define in back-end model
                        withOnly: 'view_avl'
                    }
                },
                controller: 'AvlViewCtrl',
                resolve: {
                    trans: ['RequireTranslations',
                        function (RequireTranslations) {
                            RequireTranslations('modules/avl');
                        }],
                    dep: ['trans', '$ocLazyLoad',
                        function (trans, $ocLazyLoad) {
                            return $ocLazyLoad.load(['AvlServiceModule', 'google-map']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/avl/controllers/AvlViewCtrl.js'])
                                }
                            )
                        }]
                }
            })
            /***************************************************
             * This is admin template ui-route
             * You should remove this route in real project
             ***************************************************/
            .state('admin.ui-elements', {
                template: '<div ui-view class="fade-in-up"></div>',
                ncyBreadcrumb: {
                    label: 'UI & Elements'
                }
            })
            .state('admin.generalelements', {
                url: "/ui-elements/generalelements",
                templateUrl: "app/modules/adminTemplate/views/generalelements.html",
                ncyBreadcrumb: {
                    label: 'General Elements',
                    parent: 'admin.ui-elements'
                },
                controller: 'generalelementsCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('bootbox').then(
                                function () {
                                    return $ocLazyLoad.load('app/modules/adminTemplate/controllers/generalelementsCtrl.js');
                                }
                            );
                        }]
                }
            })
            .state('admin.typography', {
                url: "/ui-elements/typography",
                templateUrl: "app/modules/adminTemplate/views/typography.html",
                ncyBreadcrumb: {
                    label: 'Typography',
                    parent: 'admin.ui-elements'
                },
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('bs-example');
                        }
                    ]
                }

            })
            .state('admin.tab', {
                url: "/ui-elements/tab",
                templateUrl: "app/modules/adminTemplate/views/tab.html",
                ncyBreadcrumb: {
                    label: 'Tab & Accordian',
                    parent: 'admin.ui-elements'
                }
            })
            .state('admin.treeview', {
                url: "/ui-elements/treeview",
                templateUrl: "app/modules/adminTemplate/views/treeview.html",
                ncyBreadcrumb: {
                    label: 'Treeview',
                    parent: 'admin.ui-elements'
                },
                controller: 'treeviewCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['jstree']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/treeviewCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.buttons', {
                url: "/ui-elements/buttons",
                templateUrl: "app/modules/adminTemplate/views/buttons.html",
                ncyBreadcrumb: {
                    label: 'Buttons',
                    parent: 'admin.ui-elements'
                },
                controller: 'buttonsCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['ladda', 'bootstrap-iconpicker']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/vendors/angular-ladda/angular-ladda.min.js', 'app/modules/adminTemplate/controllers/buttonsCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.jquery-ui', {
                url: "/ui-elements/jquery-ui",
                templateUrl: "app/modules/adminTemplate/views/jquery-ui.html",
                ncyBreadcrumb: {
                    label: 'jQuery UI',
                    parent: 'admin.ui-elements'
                },
                controller: 'jquery-uiCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['jquery-ui']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/jquery-uiCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.nestable-list', {
                url: "/ui-elements/nestable-list",
                templateUrl: "app/modules/adminTemplate/views/nestable-list.html",
                ncyBreadcrumb: {
                    label: 'Nestable List',
                    parent: 'admin.ui-elements'
                },
                controller: 'nestable-listCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['nestable']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/nestable-listCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.dual-list', {
                url: "/ui-elements/dual-list",
                templateUrl: "app/modules/adminTemplate/views/dual-list.html",
                ncyBreadcrumb: {
                    label: 'Dual List',
                    parent: 'admin.ui-elements'
                },
                controller: 'dual-listCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['dual-list']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/dual-listCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.image-crop', {
                url: "/ui-elements/image-crop",
                templateUrl: "app/modules/adminTemplate/views/image-crop.html",
                ncyBreadcrumb: {
                    label: 'Image Crop',
                    parent: 'admin.ui-elements'
                },
                controller: 'image-cropCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['jcrop']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/image-cropCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.table', {
                template: '<div ui-view class="fade-in-up"></div>',
                ncyBreadcrumb: {
                    label: 'Table'
                }
            })
            .state('admin.tables', {
                url: "/table/tables",
                templateUrl: "app/modules/adminTemplate/views/tables.html",
                ncyBreadcrumb: {
                    label: 'Simple Tables',
                    parent: 'admin.table'
                }
            })
            .state('admin.datatables', {
                url: "/table/datatables",
                templateUrl: "app/modules/adminTemplate/views/datatables.html",
                ncyBreadcrumb: {
                    label: 'Data Tables',
                    parent: 'admin.table'
                },
                controller: 'datatablesCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['datatable']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/datatablesCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.charts', {
                template: '<div ui-view class="fade-in-up"></div>',
                ncyBreadcrumb: {
                    label: 'Charts'
                }
            })
            .state('admin.flotchart', {
                url: "/chart/flotchart",
                templateUrl: "app/modules/adminTemplate/views/flotchart.html",
                ncyBreadcrumb: {
                    label: 'Flot Charts',
                    parent: 'admin.charts'
                },
                controller: 'flotchartCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['flot']).then(
                                function () {
                                    return $ocLazyLoad.load(['flot-plugins', 'app/modules/adminTemplate/controllers/flotchartCtrl.js'])
                                }
                            );

                        }]
                }
            })
            .state('admin.morrischart', {
                url: "/chart/morrischart",
                templateUrl: "app/modules/adminTemplate/views/morrischart.html",
                ncyBreadcrumb: {
                    label: 'Morris Charts',
                    parent: 'admin.charts'
                },
                controller: 'morrischartCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['morrischart']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/morrischartCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.jquery-sparklines', {
                url: "/chart/jquery-sparklines",
                templateUrl: "app/modules/adminTemplate/views/jquery-sparklines.html",
                ncyBreadcrumb: {
                    label: 'jQuery Sparklines Charts',
                    parent: 'admin.charts'
                },
                controller: 'jquery-sparklinesCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['sparkline']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/jquery-sparklinesCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.forms', {
                template: '<div ui-view class="fade-in-up"></div>',
                ncyBreadcrumb: {
                    label: 'Forms'
                }
            })
            .state('admin.form-elements', {
                url: "/forms/form-elements",
                templateUrl: "app/modules/adminTemplate/views/form-elements.html",
                ncyBreadcrumb: {
                    label: 'Form Elements',
                    parent: 'admin.forms'
                }
            })
            .state('admin.form-validations', {
                url: "/forms/form-validations",
                templateUrl: "app/modules/adminTemplate/views/form-validations.html",
                ncyBreadcrumb: {
                    label: 'Form Validations',
                    parent: 'admin.forms'
                },
                controller: 'form-validationsCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['sweet-alert']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/form-validationsCtrl.js'])
                                }
                            );

                        }]
                }
            })
            .state('admin.wizard-validation', {
                url: "/forms/wizard-validation",
                templateUrl: "app/modules/adminTemplate/views/wizard-validation.html",
                ncyBreadcrumb: {
                    label: 'Wizard & Validation',
                    parent: 'admin.forms'
                },
                controller: 'wizard-validationCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['fuelux', 'jquery.steps', 'jquery.validate', 'sweet-alert']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/wizard-validationCtrl.js'])
                                }
                            );

                        }]
                }
            })
            .state('admin.wysiwyg-editor', {
                url: "/forms/wysiwyg-editor",
                templateUrl: "app/modules/adminTemplate/views/wysiwyg-editor.html",
                ncyBreadcrumb: {
                    label: 'WYSIWYG Editor',
                    parent: 'admin.forms'
                },
                controller: 'wysiwyg-editorCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['summernote', 'markdown', 'ckeditor', 'tinymce']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/wysiwyg-editorCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.form-plugins', {
                url: "/forms/form-plugins",
                templateUrl: "app/modules/adminTemplate/views/form-plugins.html",
                ncyBreadcrumb: {
                    label: 'Form Plugins',
                    parent: 'admin.forms'
                },
                controller: 'form-pluginsCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['x-editable', 'select2', 'ui-bootstrap', 'momentx-edit', 'jasny-bootstrap', 'knob', 'bootstrap-tagsinput', 'bootstrap-timepicker', 'clockpicker', 'bootstrap-colorpicker', 'checklist']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/form-pluginsCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.file-uploader', {
                template: '<div ui-view class="fade-in-up"></div>',
                ncyBreadcrumb: {
                    label: 'File Uploader'
                }
            })
            .state('admin.dropzone-file', {
                url: "/file-uploader/dropzone-file",
                templateUrl: "app/modules/adminTemplate/views/dropzone-file.html",
                ncyBreadcrumb: {
                    label: 'Dropzone File',
                    parent: 'admin.file-uploader'
                },
                controller: 'dropzone-fileCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['dropzone']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/dropzone-fileCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.multiple-file-upload', {
                url: "/file-uploader/multiple-file-upload",
                templateUrl: "app/modules/adminTemplate/views/multiple-file-upload.html",
                ncyBreadcrumb: {
                    label: 'Multiple File Upload',
                    parent: 'admin.file-uploader'
                },
                controller: 'multipleFileUploadCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['jquery-fileupload']).then(
                                function () {
                                    return $ocLazyLoad.load(['jquery-fileupload-feature']).then(
                                        function () {
                                            return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/multipleFileUploadCtrl.js'])
                                        }
                                    );
                                }
                            );
                        }]
                }
            })
            .state('admin.maps', {
                template: '<div ui-view class="fade-in-up"></div>',
                ncyBreadcrumb: {
                    label: 'Maps'
                }
            })
            .state('admin.vector-maps', {
                url: "/maps/vector-maps",
                templateUrl: "app/modules/adminTemplate/views/vector-maps.html",
                ncyBreadcrumb: {
                    label: 'Vector Maps',
                    parent: 'admin.maps'
                },
                controller: 'vector-mapsCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['vectormap']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/vector-mapsCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.google-map', {
                url: "/maps/google-map",
                templateUrl: "app/modules/adminTemplate/views/google-map.html",
                ncyBreadcrumb: {
                    label: 'Google Maps',
                    parent: 'admin.maps'
                },
                controller: 'google-mapCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['google-map']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/google-mapCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.satelite-map', {
                url: "/maps/satelite-map",
                templateUrl: "app/modules/adminTemplate/views/satelite-map.html",
                ncyBreadcrumb: {
                    label: 'Google Maps',
                    parent: 'admin.maps'
                },
                controller: 'google-mapCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['google-map']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/google-mapCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.directions-map', {
                url: "/maps/directions-map",
                templateUrl: "app/modules/adminTemplate/views/directions-map.html",
                ncyBreadcrumb: {
                    label: 'Google Maps',
                    parent: 'admin.maps'
                },
                controller: 'google-mapCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['google-map']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/google-mapCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.mailbox', {
                url: "/mailbox",
                templateUrl: "app/modules/adminTemplate/views/mailbox.html",
                ncyBreadcrumb: {
                    label: 'Mailbox'
                },
                controller: 'mailboxCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['summernote', 'jasny-bootstrap']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/mailboxCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.gallery', {
                url: "/gallery",
                templateUrl: "app/modules/adminTemplate/views/gallery.html",
                ncyBreadcrumb: {
                    label: 'Gallery'
                },
                controller: 'galleryCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['blueimp-gallery', 'yep-gallery']).then(
                                function () {
                                    return $ocLazyLoad.load(['bootstrap-image-gallery', 'app/modules/adminTemplate/controllers/galleryCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.calendar', {
                url: "/calendar",
                templateUrl: "app/modules/adminTemplate/views/calendar.html",
                ncyBreadcrumb: {
                    label: 'Calendar'
                },
                controller: 'calendarCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['momentjs', 'jquery-ui-custom', 'bootbox']).then(
                                function () {
                                    return $ocLazyLoad.load(['fullcalendar']).then(
                                        function () {
                                            return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/calendarCtrl.js'])
                                        }
                                    );
                                }
                            );
                        }]
                }
            })
            .state('admin.more-pages', {
                template: '<div ui-view class="fade-in-up"></div>',
                ncyBreadcrumb: {
                    label: 'More Pages'
                }
            })
            .state('admin.timeline', {
                url: "/more-page/timeline",
                templateUrl: "app/modules/adminTemplate/views/timeline.html",
                ncyBreadcrumb: {
                    label: 'Timeline',
                    parent: 'admin.more-pages'
                }
            })
            .state('admin.invoice', {
                url: "/more-page/invoice",
                templateUrl: "app/modules/adminTemplate/views/invoice.html",
                ncyBreadcrumb: {
                    label: 'Invoice',
                    parent: 'admin.more-pages'
                }
            })
            .state('admin.search-page', {
                url: "/more-page/search-page",
                templateUrl: "app/modules/adminTemplate/views/search-page.html",
                ncyBreadcrumb: {
                    label: 'Search Page',
                    parent: 'admin.more-pages'
                },
                controller: 'search-pageCtrl',
                resolve: {
                    dep: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['sparkline', 'easypiechart']).then(
                                function () {
                                    return $ocLazyLoad.load(['app/modules/adminTemplate/controllers/search-pageCtrl.js']);
                                }
                            );
                        }]
                }
            })
            .state('admin.blank', {
                url: "/more-page/blank",
                templateUrl: "app/modules/adminTemplate/views/blank.html",
                ncyBreadcrumb: {
                    label: 'Blank',
                    parent: 'admin.more-pages'
                }
            });

    })
    .service('WebSocketService', function ($websocket, $rootScope) {
        // Open a WebSocket connection websocket
        var ws = null;
        var wsUri = "ws://localhost:8080/";
        var isConnected = false;
        var open_websocket = function () {

            ws = $websocket(wsUri);

            ws.onOpen(function (event) {
                isConnected = true;
                $rootScope.$broadcast('connection:opened', event);
            });

            ws.onClose(function (event) {
                if (isConnected) {
                    isConnected = false;
                }
                else {
                    console.log('no response from server IN CONFIG ' + event);
                    ws.close();
                    //  ws = null;
                }
                $rootScope.$broadcast('connection:lost', event);
            });

            ws.onMessage(function (event) {
                var response;
                try {
                    response = JSON.parse(event.data);
                    $rootScope.$broadcast('message_income', response);
                } catch (e) {
                    response.timeStamp = event.timeStamp;
                }
            });

            ws.onerror = function (response) {
                response = JSON.parse(response.data);
                console.log('client error ' + response);
                $rootScope.$broadcast('connection:error', response);
            };
            return ws;
        }
        var close_websocket = function close() {
            ws.close();
        }

        return {
            close_websocket_client_connection: close_websocket,
            open_websocket_client_connection: open_websocket,
            status: function () {
                if (ws != null) {
                    return ws.readyState;
                }
            },
            send: function (message) {
                if (angular.isString(message)) {
                    ws.send(message);
                }
                else if (angular.isObject(message)) {
                    ws.send(JSON.stringify(message));
                }
            }
        }
    });



