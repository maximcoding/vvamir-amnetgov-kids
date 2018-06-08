"use strict";


var app = angular.module('ng-laravel', ['momentjs', 'luegg.directives']); //'MQTTService',

app.controller('chatCtrl', function (JQ_CONFIG, $scope, $localStorage, OrganizationService, SweetAlert, ConversationService, $rootScope, WebSocketService, $auth, $timeout, MessageService, UserService, $translatePartialLoader, Notification, trans) {
    var commands = JQ_CONFIG['COMMANDS'];
    var token = $localStorage.ngAA_token;
    $scope.user_online = '';
    $scope.user = [];
    $scope.user = $auth.getProfile().$$state.value;
    $scope.organization_users = [];
    $scope.typed_text = '';
    var message_to_transer = {};
    message_to_transer.conversation = {};
    message_to_transer.conversation.conversation_participants = [];
    $scope.organization_name = {};
    $scope.active_conversation = {conversation_messages: []};
    var conversation = {conversation_participants: [], topic: '', about: ''};
    $scope.conversations = [];
    var default_participants = [];
    var deleted_conversation = {};

    $scope.remove_user_from_conversation = function (conversation) {
        SweetAlert.swal($rootScope.areYouSureDelete,
            function (isConfirm) {
                if (isConfirm) {
                    ConversationService.delete(conversation.conversation_id);
                    deleted_conversation = conversation;
                    SweetAlert.swal($rootScope.recordDeleted);
                }
            });
    };

    $scope.submit = function (new_message) {
        if (!new_message) {
            return;
        }
        WebSocketService.send(new_message);
        $scope.new_message = '';
    };
    UserService.list($scope.user.organization_id).then(function (users) {
        $scope.organization_users = users;
        //COMMAND = 1 NOTIFY TO OTHERS USER CONNECTED
        // // $scope.active_conversation.messages = [];
        // MessageService.list($scope.user.organization_id).then(function (response) {
        //     $scope.user_online = WebSocketService.status();
        //     $scope.active_conversation.messages = [];
        //     var user_last_message = false;
        //     angular.forEach(response, function (message) {
        //         message.avatar_url = '';
        //         message.created_at = moment.utc(message.created_at).local().calendar();
        //         angular.forEach(users, function (org_user) {
        //             if (org_user.user_id == message.sender_id) {
        //                 message.avatar_url = org_user.avatar_url;
        //                 $scope.active_conversation.messages.push(message);
        //                 MessageService.addMessage(message);
        //                 user_last_message = true;
        //             }
        //         });
        //     })
        //     if (user_last_message) {
        //         UserService.update_time_message($scope.user.id);
        //     }
        // });
    })

    /*Get list of Conversations*/
    ConversationService.list($scope.user.organization_id).then(function (response) {
        angular.forEach(response, function (row) {
            angular.forEach(row.conversation_messages, function (message) {
                message.created_at = moment.utc(message.created_at).local().calendar()
            })
            var conversation = {
                conversation_id: row.conversation_id,
                about: row.about,
                topic: row.about,
                created_at: row.created_at = moment.utc(row.created_at).local().calendar(),
                conversation_participants: row.conversation_participants,
                conversation_messages: row.conversation_messages,
                has_unreaded_messages: 0
            };

            // PUBLIC ROOM AS DEFAULT CONVERSATION
            if (row.about == $scope.user.organization_id) {
                OrganizationService.show($scope.user.organization_id).then(function (organization) {
                    $scope.organization_name = organization.name;
                })
            }
            $scope.conversations.push(conversation);
        })
        $scope.active_conversation = $scope.conversations[0];
        $scope.activeWindow = $scope.active_conversation.conversation_id;
    })


    $scope.onAddingUserToConversation = function ($item, $model, $label) {
        //create new conversation object
        default_participants = [];
        default_participants.push($scope.user.id);
        default_participants.push($model.id);
        conversation.about = $scope.user.firstname + ' ' +
            $scope.user.lastname + ',' +
            $model.firstname + ' ' + $model.lastname;
        conversation.topic = $scope.user.organization_id;
        conversation.conversation_participants = default_participants;
        conversation.conversation_messages = [];
        // WHEN YOU CREATE CONVERSATION ..PUSH TO YOUR PRESENT CONVERSATIONS AND PUSH TO OTHERS
        ConversationService.create(conversation).then(function (response) {
            var just_created = response;
            default_participants = [];
            default_participants.push({participant_id: $scope.user.id, conversation_id: response.conversation_id});
            default_participants.push({participant_id: $model.id, conversation_id: response.conversation_id});
            // must be rewrited
            conversation.conversation_participants = default_participants;
            $scope.activeWindow = response.conversation_id;
            conversation.about = response.about;
            conversation.created_at = moment.utc(response.created_at).local().calendar();
            conversation.conversation_id = response.conversation_id;
            //NOTIFY TO PARTICIPANT THAT ADDED TO THE GROUP
            var message_object = {};
            message_object.command = commands['USER_CHAT_CONVERSATION_CREATED']; // OPEN NEW CONVERSATION
            message_object.topic = response.topic;
            message_object.sender_id = $scope.user.id;
            message_object.conversation_id = response.conversation_id;
            message_object.message = 'added';
            message_object.sent = 0;
            message_object.token = token;
            MessageService.create(message_object).then(function (response) {
                message_object.conversation = just_created;
                message_object.conversation.conversation_messages = [];
                message_object.conversation.conversation_participants = default_participants;
                UserService.update_time_message($scope.profile.id);
                $scope.submit(message_object);
            })
        })
    };

    $scope.found_users = [];
    $scope.searchUser = function (queryUser) {
        if (queryUser.length > 1) {
            UserService.search(queryUser, "50").then(function (response) {
                $scope.found_users = [];
                angular.forEach(response, function (data) {
                    $scope.found_users.push(data);
                })
            });
        }
    }

    // {"conversation":{"conversation_id":"1","about":"2",
    // "conversation_participants":
    // [{"id":"1","conversation_id":1,"participant_id":1},
    // {"id":"","conversation_id":1,"participant_id":2},
    // {"id":"3","conversation_id":1,"participant_id":3},
    // {"id":"4","conversation_id":1,"participant_id":4},
    // {"id":"5","conversation_id":1,"participant_id":5},
    // {"id":"56","conversation_id":1,"participant_id":6}]},
    // "message":"ddd","command":3,"topic":2,"sender_id":1,"sent":0,
    // "token":""}


    $scope.create_message = function (typed_text) {
        if (typed_text !== '') {
            var message_to_save = {};
            message_to_save.message = typed_text;
            message_to_save.command = commands['USER_WS_MESSAGE']; // COMMON MESSAGE
            message_to_save.topic = $scope.user.organization_id;
            message_to_save.sender_id = $scope.user.id;
            message_to_save.conversation_id = $scope.active_conversation.conversation_id;
            message_to_save.sent = 0;
            MessageService.create(message_to_save).then(function (response) {
                UserService.update_time_message($scope.profile.id);
                message_to_transer = {};
                message_to_transer.conversation = {};
                message_to_transer.message = typed_text;
                message_to_transer.command = message_to_save.command;
                message_to_transer.topic = message_to_save.topic;
                message_to_transer.sender_id = message_to_save.sender_id;
                message_to_transer.sent = message_to_save.sent;
                message_to_transer.token = token;
                message_to_transer.conversation = {
                    conversation_id: $scope.active_conversation.conversation_id,
                    about: $scope.active_conversation.about
                };
                message_to_transer.conversation.conversation_participants = $scope.active_conversation.conversation_participants;
            }).then(function () {
                $scope.submit(message_to_transer);
                $scope.typed_text = '';
            })
        }
    }


    $scope.selectedConversation = function (conversation_id, index) {
        mark_as_readed(conversation_id);
        $scope.activeWindow = conversation_id;
        angular.forEach($scope.conversations, function (conver) {
            //find selected conversation and prevent of selecting the same one
            if (conver.conversation_id == conversation_id && ($scope.active_conversation.conversation_id != (conversation_id))) {
                $scope.active_conversation = {};
                $scope.active_conversation = conver;
                $scope.active_conversation.conversation_messages = conver.conversation_messages;
            }
        })
    }

    function mark_as_readed(id) {
        angular.forEach($scope.conversations, function (row) {
            if (row.conversation_id == id) {
                row.has_unreaded_messages = 0;
            }
        })
    }

    function remove_conversation(item) {
        var index = $scope.conversations.indexOf(item);
        $scope.conversations.splice(index, 1);
    }

    $scope.$on('connection:lost', function (event, data) {
        $scope.user_online = WebSocketService.status();
    });

    $scope.$on('connection:error', function (event, data) {
        $scope.user_online = WebSocketService.status();
        // timer2 = $timeout(function () {
        //     WebSocketService.open_websocket_client_connection();
        // }, 5000);
    });
    var messages_notifications = [];
    $scope.$on('message_income', function (event, message) {

        // check if this message not belongs to active conversation
        if (message.conversation !== undefined) {
            angular.forEach($scope.conversations, function (row) {
                if (row.conversation_id === message.conversation.conversation_id &&
                    row.conversation_id !== $scope.active_conversation.conversation_id) {
                    row.has_unreaded_messages = 1;
                    //      messages_notifications.push({conversation_id: row.conversation_id, value: 1});
                }
            })
        }

        angular.forEach($scope.organization_users, function (organization_user) {
            if (message.sender_id == organization_user.user_id) {
                message.firstname = organization_user.firstname;
                message.lastname = organization_user.lastname;
                message.avatar_url = organization_user.avatar_url;
            }
        })
        // standard message receive
        if (message.command == commands['USER_WS_MESSAGE']) {
            UserService.update_time_message($scope.user.id);
            // find who send the message
            angular.forEach($scope.conversations, function (row) {
                if (row.conversation_id == message.conversation.conversation_id) {
                    row.conversation_messages.push(message);
                }
            })
        }
        //conversation created
        if (message.command == commands['USER_CHAT_CONVERSATION_CREATED']) {
            UserService.update_time_message($scope.user.id);
            // find who send the message
            angular.forEach($scope.conversations, function (row) {
                if (row.conversation_id == message.conversation.conversation_id) {
                    row.conversation_messages.push(message);
                }
            })
            message.conversation.created_at = moment.utc(message.conversation.created_at).local().calendar();
            $scope.conversations.push(message.conversation);
            $scope.active_conversation = message.conversation;
        }

        // notify that someone left the conversation
        if (message.command == commands['USER_CHAT_CONVERSATION_LEFT']) {
            UserService.update_time_message($scope.user.id);
            angular.forEach($scope.conversations, function (row) {
                if (row.conversation_id == message.conversation.conversation_id) {
                    row.conversation_messages.push(message);
                }
            })
        }


    });
    $scope.$on('connection:opened', function (event, data) {
        $scope.profile = $auth.getProfile().$$state.value;
        UserService.list($scope.user.organization_id).then(function (users) {
            $scope.organization_users = users;
            // MessageService.listFromTime($scope.user.organization_id).then(function (response) {
            //     var message_object = {
            //         users: [],
            //         topic: $scope.profile.organization_id,
            //         sent: 0,
            //         command: 1, // im connected
            //         message: '',
            //         sender_id: $scope.profile.id,
            //         token: token,
            //     };
            //     WebSocketService.send(message_object);
            //     $scope.user_online = WebSocketService.status();
            //     var user_last_message = false;
            //     angular.forEach(response, function (message) {
            //         message.avatar_url = '';
            //         message.created_at = moment.utc(message.created_at).local().calendar();
            //         angular.forEach(users, function (org_user) {
            //             if (org_user.user_id == message.sender_id) {
            //                 message.avatar_url = org_user.avatar_url;
            //                 MessageService.addMessage(message);
            //                 user_last_message = true;
            //             }
            //         });
            //     });
            //     if (user_last_message) {
            //         UserService.update_time_message($scope.user.id);
            //     }
            // });
        })
    });
    // update list when conversation deleted
    $scope.$on('conversation.delete', function () {
        SweetAlert.swal($rootScope.recordDeleted);
        //remove from UI also
        remove_conversation(deleted_conversation);
        // notify to other that left conversation
        var message_to_transer = {};
        message_to_transer.conversation = {};
        message_to_transer.message = 'left';
        message_to_transer.command = commands['USER_CHAT_CONVERSATION_LEFT'];
        message_to_transer.topic = $scope.user.organization_id;
        message_to_transer.sender_id = $scope.user.id;
        message_to_transer.sent = 0;
        message_to_transer.token = token;
        message_to_transer.conversation = {
            conversation_id: deleted_conversation.conversation_id,
            about: deleted_conversation.about,
            conversation_participants: deleted_conversation.conversation_participants
        };
        $scope.submit(message_to_transer);
    });
    $scope.$on('conversation.not.delete', function () {
        SweetAlert.swal($rootScope.recordNotDeleted);
    });
    /*
     * Get user and refresh cache.
     * At first check cache, if exist, we return data from cache and if don't exist return from API
     */
    UserService.show_profile($scope.user.id).then(function (data) {
        $scope.room_as_topic = '';
        $scope.other_user_data = data[0];
        $scope.topic = $scope.user.organization_id;
    });


});

