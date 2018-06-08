"use strict";
angular.module('ng-laravel')
    .controller('AdminCtrl', function (JQ_CONFIG, WebSocketService, MessageService, $scope, $localStorage, $timeout, $filter, $http, $auth, $injector, UserService, hotkeys, $state, $translate, $rootScope, $translatePartialLoader, uibPaginationConfig, trans) {

        var commands = JQ_CONFIG['COMMANDS'];
        if (!$localStorage.data) {
            $localStorage.data = {};
        }
        WebSocketService.open_websocket_client_connection();
        $scope.users_online = [];
        $scope.users_offline = [];
        $scope.chat_messages = [];
        $scope.organization_users = [];
        $scope.bell_notification_count = '';
        $scope.url_state_now = '';
        var timer_reconnect = "";
        var timer_before_ping = '';
        var token = $localStorage.ngAA_token;

        $scope.reset_messages = function () {
            $scope.chat_messages = [];
            $scope.bell_notification_count = 0;
            UserService.update_time_message($scope.profile.id);
        }

        $scope.redirect_to_chat = function () {
            var $state = $injector.get("$state");
            $state.go('admin.chat');
        }

        function init() {
            /* Get user profile info */
            $scope.user_online = WebSocketService.status();
            $scope.profile = $auth.getProfile().$$state.value;
            UserService.list($scope.profile.organization_id).then(function (data) {
                angular.forEach(data, function (org_user) {
                    org_user.last_token_time = moment.utc(org_user.last_token_time).local().calendar();
                    $scope.organization_users.push(org_user);
                })
            }).then(function () {
                MessageService.listFromTime($scope.profile.id).then(function (response) {
                    $scope.user_online = WebSocketService.status();
                    $scope.chat_messages = [];
                    var count = 0;
                    angular.forEach(response, function (message) {
                        message.avatar_url = '';
                        count++;
                        message.created_at = moment.utc(message.created_at).local().calendar();
                        angular.forEach($scope.organization_users, function (org_user) {
                            if (org_user.user_id == message.sender_id) {
                                message.firstname = org_user.firstname;
                                message.lastname = org_user.lastname;
                                message.avatar_url = org_user.avatar_url;
                                $scope.chat_messages.push(message);
                            }
                        });
                    })
                    $scope.bell_notification_count = count;
                });
            })
        }

        init();


        $scope.$on('message_income', function (event, message) {
            // FIND USER THAT SEND MESSAGE
            angular.forEach($scope.organization_users, function (organization_user) {
                // find who send the message
                if (message.sender_id === organization_user.user_id) {
                    message.firstname = organization_user.firstname;
                    message.lastname = organization_user.lastname;
                    message.avatar_url = organization_user.avatar_url;
                    message.created_at = moment.utc(message.created_at).local().calendar();
                }
            })

            if (WebSocketService.status()) {
                if (timer_before_ping != "") {
                    $timeout.cancel(timer_before_ping);
                    timer_before_ping = "";
                }
                timer_before_ping = $timeout(function () {
                    var message_object = {
                        token: token,
                        users: [],
                        topic: $scope.profile.organization_id,
                        sent: 0,
                        command: commands['USER_WS_HEARTBEAT'], // ping message
                        message: '__/\\_HEARTBEAT_/\\_',
                        sender_id: $scope.profile.id
                    };
                    WebSocketService.send(message_object);
                }, 25000);  //25 seconds ping pong check
            }


            //push new online user
            if (message.command == commands['USER_WS_ONLINE']) {
                if (message.sender != $scope.profile.id) {
                    angular.forEach($scope.organization_users, function (organization_user) {
                        UserService.addUser(organization_user);
                        if (message.sender_id == organization_user.user_id) {
                            if ($scope.users_online.indexOf(organization_user) == -1) {
                                $scope.users_online.push(organization_user);
                            }
                        }
                    })
                }
            }
            // someone disconnected - delete him
            if (message.command == commands['USER_WS_DISCONNECTED']) {
                $scope.users_online = _.filter($scope.users_online, function (user_online) {
                    return !(user_online.id == message.sender_id);
                });
                // angular.forEach($scope.organization_users, function (organization_user) {
                //     if (message.sender_id == organization_user.user_id) {
                //         $scope.users_offline.push(organization_user);
                //     }
                // })
            }
            //when just connected receiving all online users
            if (message.command == commands['USER_WS_CONNECTED']) {
                $scope.filterBy = JSON.parse(message.users);
                $scope.users_online = $scope.organization_users.filter(function (o) {
                    return $scope.filterBy.some(function (i) {
                        return i.id === o.user_id;
                    });
                });
                // $scope.users_offline = $scope.organization_users.filter(function (a) {
                //     return $scope.filterBy.some(function (b) {
                //         return a.id != b.user_id;
                //     });
                // });
            }
            // standard message receive
            if (message.command == commands['USER_WS_MESSAGE']) {
                if (WebSocketService.status()) {
                    if ($scope.url_state_now != "admin.chat") {
                        $scope.bell_notification_count++;
                        $scope.chat_messages.push(message);
                    }
                }
                return;
            }

            // notify that conversation created
            if (message.command == commands['USER_CHAT_CONVERSATION_CREATED']) {
                if (message.sender_id != $scope.profile.id) {
                    $scope.bell_notification_count++;
                    message.message =
                        message.firstname + ' ' +
                        message.lastname + ' ' +
                        message.message + ' you to conversation';
                    $scope.chat_messages.push(message);
                }
            }

            // notify that someone left the conversation
            if (message.command == commands['USER_CHAT_CONVERSATION_LEFT']) {
                if (message.sender_id != $scope.profile.id) {
                    $scope.bell_notification_count++;
                    message.message =
                        message.firstname + ' ' +
                        message.lastname + ' ' +
                        message.message + ' the ' +
                        ' conversation';
                    $scope.chat_messages.push(message);
                }
            }

        });
        $scope.$on('connection:lost', function (event, data) {
            $scope.user_online = WebSocketService.status();
            $rootScope.$broadcast('connection:error', event);
            $scope.bell_notification_count = "Offline";
        });
        $scope.$on('connection:error', function (event, data) {
            $scope.user_online = WebSocketService.status();
            if (timer_reconnect != null) {
                $timeout.cancel(timer_reconnect);
            }
            timer_reconnect = $timeout(function () {
                WebSocketService.open_websocket_client_connection();
            }, 10000); // 10 seconds recovery connection retry
            $scope.bell_notification_count = "Offline";
        });
        $scope.$on('connection:opened', function (event, data) {
            $timeout.cancel(timer_reconnect);
            var timer_subsrcibe = $timeout(function () {
                //   $scope.organization_users = data;
                //COMMAND = 1 NOTIFY TO OTHERS USER CONNECTED
                var message_object = {
                    token: token,
                    users: [],
                    topic: $scope.profile.organization_id,
                    sent: 0,
                    command: commands['USER_WS_CONNECTED'], // im connected
                    message: 'online',
                    sender_id: $scope.profile.id
                };
                WebSocketService.send(message_object);
                $timeout.cancel(timer_subsrcibe);
            }, 1000);
        });


        /* show loading on page change */
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            if (toState.resolve) {
                $scope.loader = true;
            }
        });
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if (toState.resolve) {
                $scope.loader = false;
            }
            if (toState.name == "admin.chat") {
                if (WebSocketService.status()) {
                    reset_bell();
                }
            }
            $scope.url_state_now = toState.name;
        });

        function reset_bell() {
            $scope.profile = $auth.getProfile().$$state.value;
            $scope.bell_notification_count = 0;
            MessageService.setCounterNotifications(null);
            UserService.update_time_message($scope.profile.id);
        }

        /* Define keyboard short-key */
        hotkeys.add({
            combo: 'ctrl+b',
            description: 'Open Request List',
            callback: function () {
                $state.go("admin.tasks");
            }
        });
        /* Search Input & Per Page toggle */
        $scope.searchShow = false;
        $scope.perPageShow = false;

        /* Change Language Function*/
        $scope.changeLanguage = function (langKey) {
            console.log('wtf problem ' + langKey);
            $rootScope.currentLanguage = langKey;
            $translate.use(langKey);
        };

        /* get available langKey */
        $scope.AvailableLanguageKeys = $translate.getAvailableLanguageKeys();


        /* Show loading on translate switch */
        $rootScope.$on('$translateChangeStart', function () {
            $scope.transLoader = true;
        });
        $rootScope.$on('$translateChangeSuccess', function () {
            $scope.transLoader = false;
            // ui-pagination translate
            uibPaginationConfig.firstText = $translate.instant('app.shared.paging.first');
            uibPaginationConfig.previousText = $translate.instant('app.shared.paging.pre');
            uibPaginationConfig.nextText = $translate.instant('app.shared.paging.next');
            uibPaginationConfig.lastText = $translate.instant('app.shared.paging.last');
            // populate sweet alert
            $rootScope.areYouSureDelete = {
                title: $translate.instant('app.shared.alert.areYouSure'),
                text: $translate.instant('app.shared.alert.areYouSureDescription'),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: $translate.instant('app.shared.alert.confirmButtonText'),
                cancelButtonText: $translate.instant('app.shared.alert.cancelButtonText'),
                closeOnConfirm: false,
                closeOnCancel: true,
                showLoaderOnConfirm: true
            };
            // populate sweet alert
            $rootScope.areYouSureUpdate = {
                title: $translate.instant('app.shared.alert.areYouSure'),
                text: $translate.instant('app.shared.alert.areYouSureDescription'),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: $translate.instant('app.shared.alert.confirmButtonText'),
                cancelButtonText: $translate.instant('app.shared.alert.cancelButtonText'),
                closeOnConfirm: false,
                closeOnCancel: true,
                showLoaderOnConfirm: true
            };
            // populate sweet alert
            $rootScope.recordUpdated = {
                title: $translate.instant('app.shared.alert.updatedTitle'),
                text: $translate.instant('app.shared.alert.successUpdated'),
                type: "success",
                confirmButtonText: $translate.instant('app.shared.alert.okConfirm'),
            };
            // populate sweet alert
            $rootScope.recordDeleted = {
                title: $translate.instant('app.shared.alert.deletedTitle'),
                text: $translate.instant('app.shared.alert.successDeleted'),
                type: "success",
                confirmButtonText: $translate.instant('app.shared.alert.okConfirm'),
            };
            // populate sweet alert
            $rootScope.recordNotDeleted = {
                title: $translate.instant('app.shared.alert.errorDeleteTitle'),
                text: $translate.instant('app.shared.alert.errorDeleteDescription'),
                type: "error",
                confirmButtonText: $translate.instant('app.shared.alert.okConfirm'),
            };

            var htmlInputForm = '<div class="radio radio-primary"> <input type="radio" name="exportSelect" id="radio1" ng-model="radioValue"  value="1" checked> <label for="radio1">' + $translate.instant('app.shared.alert.selectWholeRecords') + '</label> </div> <div class="radio radio-primary"> <input type="radio" name="exportSelect" id="radio2" ng-model="radioValue" value="2"> <label for="radio2"> ' + $translate.instant('app.shared.alert.selectSelectedRecords') + ' </label> </div>';
            // populate sweet alert
            $rootScope.exportSelect = {
                title: $translate.instant('app.shared.alert.exportSelectTitle'),
                text: htmlInputForm,
                html: true,
                showCancelButton: true,
                confirmButtonText: $translate.instant("app.shared.alert.downloadExport"),
                confirmButtonColor: "#006DCC",
                cancelButtonText: $translate.instant('app.shared.alert.cancelAlert'),
                closeOnConfirm: false,
                closeOnCancel: true,
                //showLoaderOnConfirm: true
            };

            // populate sweet alert
            $rootScope.selectFileError = {
                title: $translate.instant('app.shared.alert.selectFileErrorTitle'),
                text: $translate.instant('app.shared.alert.selectFileError'),
                type: "error",
                confirmButtonText: $translate.instant('app.shared.alert.okConfirm')
            };


        });


    })
;