/**
 * oc.LazyLoad Configuration
 * key: function name of the jQuery plugin
 * value: array of the css js file located
 */
'use strict';

app
/**
 * jQuery plugin config use ui-jq directive , config the js and css files that required
 * key: function name of the jQuery plugin
 * value: array of the css js file located
 */
    .constant('JQ_CONFIG', {
        dataTable: ['app/assets/vendors/jquery-datatables/js/jquery.dataTables.js',
            'app/assets/vendors/jquery-datatables/js/dataTables.bootstrap.min.js',
            'app/assets/vendors/jquery-datatables/js/dataTables.responsive.min.js',
            'app/assets/vendors/jquery-datatables/js/dataTables.tableTools.min.js',
            'app/assets/vendors/jquery-datatables/js/dataTables.colVis.min.js'],
        vectorMap: ['app/assets/vendors/jquery-jvectormap/js/jquery-jvectormap.min.js',
            'app/assets/vendors/jquery-jvectormap/js/jquery-jvectormap-world-mill-en.min.js',
            'app/assets/vendors/jquery-jvectormap/js/jquery-jvectormap-de-merc-en.min.js',
            'app/assets/vendors/jquery-jvectormap/js/jquery-jvectormap-us-aea-en.min.js',
            'app/assets/vendors/jquery-jvectormap/js/mall-map.min.js'],
        COMMANDS: {
            USER_WS_DISCONNECTED: 0,
            USER_WS_CONNECTED: 1,
            USER_WS_ONLINE: 2,
            USER_WS_MESSAGE: 3,
            MQTT_SUBSCRIBE: 10,
            MQTT_AVL_REPORT: 11,
            USER_WS_HEARTBEAT: 77,
            USER_CHAT_CONVERSATION_CREATED: 88,
            USER_CHAT_CONVERSATION_LEFT: 99
        }
    })

    .config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
        $ocLazyLoadProvider.config({
            debug: false,
            events: true,
            modules: [
                {
                    name: 'bootbox',
                    files: [
                        'app/assets/vendors/bootbox/js/bootbox.js'
                    ]
                },
                {
                    name: 'bs-example',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/css/bs-example.min.css'
                    ]
                },
                {
                    name: 'jstree',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/jstree/css/proton/style.min.css',
                        'app/assets/vendors/jstree/js/jstree.min.js',
                        'app/vendors/jstree-directive/jsTree.directive.min.js'
                    ]
                },
                {
                    name: 'ladda',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/ladda-button/css/ladda-themeless.min.css',
                        'app/assets/vendors/ladda-button/js/spin.min.js',
                        'app/assets/vendors/ladda-button/js/ladda.min.js'
                    ]
                },
                {
                    name: 'bootstrap-iconpicker',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/bootstrap-iconpicker/css/bootstrap-iconpicker.min.css',
                        'app/assets/vendors/bootstrap-iconpicker/js/iconset/iconset-glyphicon.min.js',
                        'app/assets/vendors/bootstrap-iconpicker/js/iconset/iconset-fontawesome-4.2.0.min.js',
                        'app/assets/vendors/bootstrap-iconpicker/js/bootstrap-iconpicker.min.js'
                    ]
                },
                {
                    name: 'momentjs',
                    files: [
                        'app/assets/vendors/momentjs/js/moment.min.js',
                    ]
                },
                {
                    name: 'datatable',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/jquery-datatables/css/dataTables.bootstrap.min.css',
                        'app/assets/vendors/jquery-datatables/css/dataTables.responsive.min.css',
                        'app/assets/vendors/jquery-datatables/css/dataTables.tableTools.min.css',
                        'app/assets/vendors/jquery-datatables/css/dataTables.colVis.min.css'
                    ]
                },
                {
                    name: 'jquery-ui',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/jquery-ui-bootstrap/css/jquery-ui.custom.min.css'
                    ]
                },
                {
                    name: 'nestable',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/jquery-nestable/js/jquery.nestable.min.js',
                        'app/assets/vendors/jquery-nestable/css/jquery-nestable.min.css',
                        'app/vendors/angular-ui-tree/css/angular-ui-tree.min.css',
                        'app/vendors/angular-ui-tree/js/angular-ui-tree.min.js'
                    ]
                },
                {
                    name: 'dual-list',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/bootstrap-duallistbox/css/bootstrap-duallistbox.min.css',
                        'app/assets/vendors/bootstrap-duallistbox/js/jquery.bootstrap-duallistbox.min.js',
                        'app/vendors/angular-bootstrap-duallistbox/angular-bootstrap-duallistbox.js'
                    ]
                },
                {
                    name: 'jcrop',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/jcrop/js/Jcrop.min.js',
                        'app/assets/vendors/jcrop/css/Jcrop.min.css'
                    ]
                },
                {
                    name: 'sparkline',
                    files: [
                        'app/assets/vendors/jquery-sparkline/js/jquery.sparkline.min.js',
                        'app/directives/yep-sparkline.js'
                    ]
                },
                {
                    name: 'morrischart',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/morrisjs/css/morris.min.css',
                        'app/assets/vendors/morrisjs/js/raphael.min.js',
                        'app/assets/vendors/morrisjs/js/morris.min.js',
                        'app/directives/morris.js'
                    ]
                },
                {
                    name: 'summernote',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/summernote/css/summernote.min.css',
                        'app/assets/vendors/summernote/js/summernote.min.js',
                        'app/vendors/angular-summernote/angular-summernote.min.js'
                    ]
                },
                {
                    name: 'markdown',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/bootstrap-markdown/css/bootstrap-markdown.min.css',
                        'app/assets/vendors/bootstrap-markdown/js/markdown.min.js',
                        'app/assets/vendors/bootstrap-markdown/js/to-markdown.min.js',
                        'app/assets/vendors/bootstrap-markdown/js/bootstrap-markdown.min.js'
                    ]
                },
                {
                    name: 'ckeditor',
                    files: [
                        'app/assets/vendors/ckeditor/js/ckeditor.js',
                        'app/vendors/ng-ckeditor/ng-ckeditor.min.js'
                    ]
                },
                {
                    name: 'tinymce',
                    files: [
                        'app/assets/vendors/tinymce/tinymce.min.js',
                        'app/vendors/ui-tinymce/tinymce.min.js'
                    ]
                },
                {
                    name: 'x-editable',
                    insertBefore: '#yep-style',
                    files: [
                        'app/vendors/angular-xeditable/css/xeditable.min.css',
                        'app/assets/vendors/x-editable/js/bootstrap-editable.min.js',
                        'app/vendors/angular-xeditable/js/xeditable.min.js'
                    ]
                },
                {
                    name: 'checklist',
                    files: [
                        'app/vendors/angular-xeditable/js/lib/checklist-model.js'
                    ]
                },
                {
                    name: 'select2',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/select2/css/select2.min.css',
                        'app/assets/vendors/select2/js/select2.min.js',
                        'app/vendors/ui-select/css/select.min.css',
                        'app/vendors/ui-select/js/select.min.js'
                    ]
                },
                {
                    name: 'ui-bootstrap',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/typeaheadjs/css/typeahead.js-bootstrap.min.css',
                        'app/vendors/angular-xeditable/js/lib/ui-bootstrap-tpls-0.6.0.min.js'
                    ]
                },
                {
                    name: 'momentx-edit',
                    files: [
                        'app/vendors/angular-xeditable/js/lib/moment.min.2.5.0.js'
                    ]
                },
                {
                    name: 'jasny-bootstrap',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/jasny-bootstrap/css/jasny-bootstrap.min.css',
                        'app/assets/vendors/jasny-bootstrap/js/jasny-bootstrap.min.js'
                    ]
                },
                {
                    name: 'knob',
                    files: [
                        'app/assets/vendors/jquery-knob/js/jquery.knob.min.js'
                    ]
                },
                {
                    name: 'bootstrap-tagsinput',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/bootstrap-tagsinput/css/bootstrap-tagsinput.min.css',
                        'app/assets/vendors/bootstrap-tagsinput/js/bootstrap-tagsinput.min.js'
                    ]
                },
                {
                    name: 'bootstrap-toggle',
                    files: [
                        '../angular-frontend/app/directives/bootstrap-toggle.js',
                    ]
                },
                {
                    name: 'bootstrap-timepicker',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                        'app/assets/vendors/bootstrap-timepicker/js/bootstrap-timepicker.min.js'
                    ]
                },
                {
                    name: 'clockpicker',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/clockpicker/css/bootstrap-clockpicker.min.css',
                        'app/assets/vendors/clockpicker/js/bootstrap-clockpicker.min.js'
                    ]
                },
                {
                    name: 'bootstrap-colorpicker',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/bootstrap-colorpicker/css/bootstrap-colorpicker.min.css',
                        'app/assets/vendors/bootstrap-colorpicker/js/bootstrap-colorpicker.min.js'
                    ]
                },
                {
                    name: 'dropzone',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/dropzone/css/basic.min.css',
                        'app/assets/vendors/dropzone/css/dropzone.min.css',
                        'app/assets/vendors/dropzone/js/dropzone.min.js',
                        'app/directives/dropzone.js'
                    ]
                },
                {
                    name: 'jquery-fileupload',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/jquery-file-upload/css/blueimp-gallery.min.css',
                        'app/assets/vendors/jquery-file-upload/css/jquery.fileupload.min.css',
                        'app/assets/vendors/jquery-file-upload/css/jquery.fileupload-ui.min.css',
                        'app/assets/vendors/jQuery-File-Upload/js/load-image.all.min.js',
                        'app/assets/vendors/jQuery-File-Upload/js/canvas-to-blob.min.js',
                        'app/assets/vendors/jquery-file-upload/js/jquery.blueimp-gallery.min.js',
                        'app/assets/vendors/jquery-file-upload/js/jquery.iframe-transport.min.js',
                        'app/assets/vendors/jquery-file-upload/js/jquery.fileupload.min.js'
                    ]
                },
                {
                    name: 'jquery-fileupload-feature',
                    files: [
                        'app/assets/vendors/jquery-file-upload/js/jquery.fileupload-process.min.js',
                        'app/assets/vendors/jquery-file-upload/js/jquery.fileupload-image.min.js',
                        'app/assets/vendors/jquery-file-upload/js/jquery.fileupload-audio.min.js',
                        'app/assets/vendors/jquery-file-upload/js/jquery.fileupload-video.min.js',
                        'app/assets/vendors/jquery-file-upload/js/jquery.fileupload-validate.min.js',
                        'app/assets/vendors/jquery-file-upload/js/jquery.fileupload-angular.min.js'
                    ]
                },
                {
                    name: 'yep-gallery',
                    files: [
                        'app/directives/yep-gallery.js'
                    ]
                },
                {
                    name: 'vectormap',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/jquery-jvectormap/css/jquery-jvectormap.min.css'
                    ]
                },
                {
                    name: 'google-map',
                    files: [
                        'app/vendors/angularjs-google-maps/ng-map.min.js'
                    ]
                },
                {
                    name: 'blueimp-gallery',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/bootstrap-image-gallery/css/blueimp-gallery.min.css',
                        'app/assets/vendors/bootstrap-image-gallery/js/jquery.blueimp-gallery.min.js',
                        'app/directives/blueimpgallery.js'
                    ]
                },
                {
                    name: 'bootstrap-image-gallery',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/bootstrap-image-gallery/css/bootstrap-image-gallery.min.css',
                        'app/assets/vendors/bootstrap-image-gallery/js/bootstrap-image-gallery.min.js'
                    ]
                },
                {
                    name: 'jquery-ui-custom',
                    files: [
                        'app/assets/vendors/jquery-ui/js/jquery-ui.custom.min.js'
                    ]
                },
                {
                    name: 'fullcalendar',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/fullcalendar/css/fullcalendar.min.css',
                        'app/assets/vendors/fullcalendar/js/fullcalendar.min.js'
                    ]
                },
                {
                    name: 'easypiechart',
                    files: [
                        'app/assets/vendors/easy-pie-chart/js/jquery.easypiechart.min.js'
                    ]
                },
                {
                    name: 'sweet-alert',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/sweetalert/css/sweetalert.min.css',
                        'app/assets/vendors/sweetalert/js/sweetalert.min.js',
                        'app/vendors/ng-sweet-alert/SweetAlert.min.js'
                    ]
                },
                {
                    name: 'jquery.steps',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/jquery-steps/css/jquery.steps.css',
                        'app/assets/vendors/jquery-steps/js/jquery.steps.min.js'
                    ]
                },
                {
                    name: 'fuelux',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/fuelux/css/fuelux.wizard.min.css',
                        'app/assets/vendors/fuelux/js/fuelux.min.js',
                        'app/assets/vendors/fuelux/js/wizard.min.js'
                    ]
                },
                {
                    name: 'jquery.validate',
                    files: [
                        'app/assets/vendors/jquery-validation/js/jquery.validate.min.js'
                    ]
                },
                {
                    name: 'flot',
                    files: [
                        'app/assets/vendors/flot/js/jquery.flot.min.js',
                        'app/vendors/angular-flot/angular-flot.min.js'
                    ]
                },
                {
                    name: 'flot-plugins',
                    files: [
                        'app/assets/vendors/flot/js/jquery.flot.fillbetween.min.js',
                        'app/assets/vendors/flot/js/jquery.flot.pie.min.js',
                    ]
                },
                {
                    name: 'panel-flat',
                    files: [
                        'app/directives/panel-flat.js'
                    ]
                },
                {
                    name: 'ui-bs-paging',
                    files: [
                        'app/vendors/ui-bootstrap/ui-bootstrap-paginaton.min.js'
                    ]
                },
                {
                    name: 'ui-bs-alert',
                    files: [
                        'app/vendors/ui-bootstrap/ui-bootstrap-alert.min.js'
                    ]
                },
                {
                    name: 'fancybox-plus',
                    insertBefore: '#yep-style',
                    files: [
                        'app/assets/vendors/fancybox-plus/css/jquery.fancybox-plus.min.css',
                        'app/assets/vendors/fancybox-plus/js/jquery.fancybox-plus.min.js',
                        'app/vendors/angular-fancybox-plus/angular-fancybox-plus.min.js'
                    ]
                },
                {
                    name: 'angular-wizard',
                    insertBefore: '#yep-style',
                    files: [
                        'app/vendors/angular-wizard/css/angular-wizard.min.css',
                        'app/vendors/angular-wizard/js/angular-wizard.min.js'
                    ]
                },
                {
                    name: 'angular-ui-notification',
                    insertBefore: '#yep-style',
                    files: [
                        'app/vendors/angular-ui-notification/css/angular-ui-notification.min.css',
                        'app/vendors/angular-ui-notification/js/angular-ui-notification.js'
                    ]
                },
                {
                    name: 'angular-bootstrap-multiselect',
                    files: [
                        'app/assets/vendors/bower_components/angularjs-dropdown-multiselect/dist/angularjs-dropdown-multiselect.min.js'
                    ]
                },
                {
                    name: 'angular-sc-select',
                    files: [
                        'app/assets/vendors/bower_components/angular-sc-select/dist/sc-select.css',
                        'app/assets/vendors/bower_components/angular-sc-select/dist/sc-select.js'
                    ]
                },
                {
                    name: 'angular-ui-bootstrap',
                    files: [
                        'app/vendors/angular-ui-bootstrap/dist/ui-bootstrap-csp.css',
                        'app/vendors/angular-ui-bootstrap/dist/ui-bootstrap.js'
                    ]
                },
                {
                    name: 'duallist',
                    files: [
                        'app/assets/vendors/bower_components/ng-duallist/ngduallist.css',
                        'app/assets/vendors/bower_components/ng-duallist/ngduallist.js'
                    ]
                },
                {
                    name: 'angular-filter',
                    files: [
                        'app/assets/vendors/bower_components/angular-filter/dist/angular-filter.js',
                    ]
                },
                {
                    name: 'my-angular-daterange',
                    files: [
                        // 'app/assets/vendors/momentjs/js/moment.min.js',
                        'app/assets/vendors/bower_components/bootstrap-daterangepicker/daterangepicker.js',
                        'app/assets/vendors/bower_components/angular-daterangepicker/js/angular-daterangepicker.min.js',
                        'app/assets/vendors/bower_components/bootstrap-daterangepicker/daterangepicker.css'
                    ]
                },
                {
                    name: 'my-custom-angular-daterange',
                    files: [
                        'app/assets/vendors/bower_components/bootstrap-daterangepicker/daterangepicker.js',
                        'app/assets/vendors/bower_components/angular-daterangepicker/js/angular-daterangepicker.min.js',
                        'app/assets/vendors/bower_components/bootstrap-daterangepicker/daterangepicker.css',
                        'app/assets/vendors/date-range/bower_components/ng-bs-daterangepicker/dist/ng-bs-daterangepicker.min.js'
                    ]
                },

                {
                    name: 'angular-selector',
                    files: [
                        'app/assets/vendors/bower_components/bower_components/angular-selector/dist/angular-selector.min.js',
                        'app/assets/vendors/bower_components/bower_components/angular-selector/dist/angular-selector.min.css',
                    ]
                },
                {
                    name: 'lazy-multiselect-io-select',
                    files: [
                        'app/assets/vendors/bower_components/oi.select/dist/select.min.css',
                        'app/assets/vendors/bower_components/oi.select/dist/select.min.js',
                        'app/assets/vendors/bower_components/oi.select/dist/select-tpls.min.js'
                    ]
                },

                {
                    name: 'angular-scroll-glue',
                    files: [
                        'app/assets/vendors/bower_components/angular-scroll-glue/src/scrollglue.js',
                    ]
                },
                {
                    name: 'angular-country-timezone',
                    files: [
                        'app/assets/vendors/bower_components/angular-country-timezone-picker/angular-country-timezone-picker.min.js',
                    ]
                },

                /***************************************************************
                 * ngLaravel App Services Module
                 ***************************************************************/
                {
                    name: 'UserServiceModule',
                    files: [
                        'app/modules/user/services/UserService.js'
                    ]
                }
                ,
                {
                    name: 'TaskServiceModule',
                    files: [
                        'app/modules/task/services/TaskService.js'
                    ]
                }
                ,
                {
                    name: 'RoleServiceModule',
                    files: [
                        'app/modules/role/services/RoleService.js'
                    ]
                }
                ,
                {
                    name: 'PermissionServiceModule',
                    files: [
                        'app/modules/permission/services/PermissionService.js'
                    ]
                }
                ,
                {
                    name: 'CategoryServiceModule',
                    files: [
                        'app/modules/category/services/CategoryService.js'
                    ]
                }
                ,
                {
                    name: 'TagServiceModule',
                    files: [
                        'app/modules/tag/services/TagService.js'
                    ]
                }
                ,
                {
                    name: 'CommentServiceModule',
                    files: [
                        'app/modules/comment/services/CommentService.js'
                    ]
                }
                ,
                {
                    name: 'OrganizationServiceModule',
                    files: [
                        'app/modules/organization/services/OrganizationService.js'
                    ]
                }
                ,
                {
                    name: 'SubOrganizationServiceModule',
                    files: [
                        'app/modules/suborganization/services/SubOrganizationService.js'
                    ]
                }
                ,
                {
                    name: 'AssetsResourceServiceModule',
                    files: [
                        'app/modules/assetsresource/services/AssetsResourceService.js'
                    ]
                },
                {
                    name: 'AssetsResourceRelationServiceModule',
                    files: [
                        'app/modules/assetsresource/services/AssetsResourceRelationService.js'
                    ]
                },
                {
                    name: 'AssetsVehicleServiceModule',
                    files: [
                        'app/modules/assetsvehicle/services/AssetsVehicleService.js'
                    ]
                }
                ,
                {
                    name: 'AssetsPersonServiceModule',
                    files: [
                        'app/modules/assetsperson/services/AssetsPersonService.js'
                    ]
                }
                ,
                {
                    name: 'AssetsGroupServiceModule',
                    files: [
                        'app/modules/assetsgroup/services/AssetsGroupService.js'
                    ]
                }
                ,
                {
                    name: 'AvlServiceModule',
                    files: [
                        'app/modules/avl/services/AvlService.js'
                    ]
                }
                ,
                {
                    name: 'PointServiceModule',
                    files: [
                        'app/modules/point/services/PointService.js'
                    ]
                }
                ,
                {
                    name: 'AssetsCategoryServiceModule',
                    files: [
                        'app/modules/assetscategory/services/AssetsCategoryService.js'
                    ]
                },
                {
                    name: 'WatcherGroupServiceModule',
                    files: [
                        'app/modules/watchergroup/services/WatcherGroupService.js'
                    ]
                },
                {
                    name: 'AssetsGroupDetailsServiceModule',
                    files: [
                        'app/modules/assetsgroupdetail/services/AssetsGroupDetailsService.js'
                    ]
                },
                {
                    name: 'MessageServiceModule',
                    files: [
                        'app/modules/messages/services/MessageService.js'
                    ]
                },

                {
                    name: 'ConversationServiceModule',
                    files: [
                        'app/modules/conversations/services/ConversationService.js'
                    ]
                },

                /****************************************************************
                 * ngLaravel App Filters module
                 ****************************************************************/
                {
                    name: 'ui-select-filter',
                    files: [
                        'app/shared/filters/uiSelectFilter.js'
                    ]
                }

            ]
        })
    }]);


