<?php


Route::group(['prefix' => 'api'], function () {

    /*
    * Organization Route
    */
    Route::post('organization/activate', 'OrganizationController@activate');
    Route::get('organization/search', 'OrganizationController@search');
    Route::resource('organization', 'OrganizationController');

    /*
* Organization Route
*/
    Route::post('suborganization', 'SubOrganizationController@store');
    Route::get('suborganization/search', 'SubOrganizationController@search');
    Route::resource('suborganization', 'SubOrganizationController');

    /*
     * AssetsResource Route
     */
    Route::post('assetsresource', 'AssetsResourceController@store');
    Route::get('assetsresource/search', 'AssetsResourceController@search');
    Route::resource('assetsresource', 'AssetsResourceController');


    /*
     * AssetsResourceRelation Route
     */
    Route::post('assetsresourcerelation', 'AssetsResourceRelationController@store');
    Route::get('assetsresourcerelation/search', 'AssetsResourceRelationController@search');
    Route::resource('assetsresourcerelation', 'AssetsResourceRelationController');

    /*
     *
     * /
     */
    Route::post('chatmessages', 'ChatMessagesController@store');
    Route::get('chatmessages/search', 'ChatMessagesController@search');
    Route::resource('chatmessages', 'ChatMessagesController');
    Route::get('chatmessages/check', 'ChatMessagesController@check');


    Route::post('conversations', 'ChatConversationsController@store');
    Route::get('conversations/search', 'ChatConversationsController@search');
    Route::resource('conversations', 'ChatConversationsController');
    Route::get('conversations/check', 'ChatConversationsController@check');


    /*
    * AssetsPerson Route
    */
    Route::post('assetsperson/customUpdate', 'AssetsPersonController@customUpdate');
    Route::post('assetsperson', 'AssetsPersonController@store');
    Route::get('assetsperson/search', 'AssetsPersonController@search');
    Route::resource('assetsperson', 'AssetsPersonController');
    /*
     * AssetsVehicle Route
     */
    Route::post('assetsvehicle', 'AssetsVehicleController@store');
    Route::get('assetsvehicle/search', 'AssetsVehicleController@search');
    Route::resource('assetsvehicle', 'AssetsVehicleController');

    /*
    * Classes Route
    */
    Route::get('assetscategory/search', 'AssetsCategoryController@search');
    Route::resource('assetscategory', 'AssetsCategoryController');

    /*
     * Groups Route
     */
    Route::post('assetsgroup', 'AssetsGroupController@store');
    Route::post('assetsgroup/customUpdate', 'AssetsGroupController@customUpdate');
    Route::get('assetsgroup/search', 'AssetsGroupController@search');
    Route::resource('assetsgroup', 'AssetsGroupController');

    /*
   * Groups Details Route
   */
    Route::post('assetsgroupdetail', 'AssetsGroupsDetailsController@store');
    Route::get('assetsgroupdetail/search', 'AssetsGroupsDetailsController@search');
    Route::resource('assetsgroupdetail', 'AssetsGroupsDetailsController');

    /*
    * Watchers Groups Route
    */
    Route::post('groupwatcher', 'GroupWatchersController@store');
    Route::post('groupwatcher/customUpdate', 'GroupWatchersController@customUpdate');
    Route::get('groupwatcher/search', 'GroupWatchersController@search');
    Route::resource('groupwatcher', 'GroupWatchersController');


    /*
    * AvlController Route
    */
    Route::get('avl/search', 'AvlController@search');
    Route::resource('avl', 'AvlController');


    /*
    * PointsOfInterests Route
   */
    Route::post('points', 'PointsController@store');
    Route::get('points/search', 'PointsController@search');
    Route::resource('points', 'PointsController');

    /*
   * import excel csv Route
   */
    Route::post('user/import_excel_csv', 'ImportController@importCSVEXCEl');
    Route::post('user/import_excel_csv_database', 'ImportController@importCSVEXCElDatabase');
    Route::post('user/{id}/delete_excel_csv', 'ImportController@deleteCSVEXCEl');


    // Password reset link request routes...
    Route::post('password/email', 'Auth\PasswordController@postEmail');

    // Password reset routes...
    Route::post('password/reset', 'Auth\PasswordController@postReset');

    // authentication
    Route::resource('authenticate', 'AuthenticateController', ['only' => ['index']]);
    Route::post('authenticate', 'AuthenticateController@authenticate');


    /*
     * User Route
     */
    Route::get('user/search', 'UserController@search');
    Route::post('user/show_profile', 'UserController@show_profile');
    Route::resource('user', 'UserController');
    Route::get('user/export/file', 'UserController@exportFile');
    Route::post('user/update_time_message', 'UserController@update_time_message');


    /*
     * Permission Route
     */
    Route::get('permission/search', 'PermissionController@search');
    Route::resource('permission', 'PermissionController');

    /*
     * Role Route
     */
    Route::get('role/search', 'RoleController@search');
    Route::resource('role', 'RoleController');

    /*
     * Task Route
     */
    Route::get('task/search', 'TaskController@search');
    Route::resource('task', 'TaskController');
    Route::get('task/export/file', 'TaskController@exportFile');
    /*
     * Comment Route
     */
    Route::get('comment/search', 'CommentController@search');
    Route::resource('comment', 'CommentController');

    /*
     * tag Route
     */
    Route::get('tag/search', 'TagController@search');
    Route::resource('tag', 'TagController');

    /*
     * Gallery Route
     */
    Route::get('gallery/search', 'GalleryController@search');
    Route::resource('gallery', 'GalleryController');


    /*
     * Category Route
     */
    Route::resource('category', 'CategoryController');

    /*
     * Upload image Controller
     */
    Route::post('/uploadimage', 'UploadController@uploadimage');
    Route::post('/deleteimage/{id}', 'UploadController@deleteUpload');


});




