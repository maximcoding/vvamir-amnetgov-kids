<?php

namespace {

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;

    /**
     * @codeCoverageIgnore
     */
    class EntrustSetupTables extends Migration
    {
        /**
         * Run the migrations.
         *
         * @return  void
         */
        public function up()
        {
            // Create table for storing roles
            Schema::create('roles', function (Blueprint $table) {
                $table->increments('id');
                $table->string('name')->unique();
                $table->string('display_name')->nullable();
                $table->string('description')->nullable();
                $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
                $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            });

            // Create table for associating roles to users (Many-to-Many)
            Schema::create('role_user', function (Blueprint $table) {
                $table->integer('user_id')->unsigned();
                $table->integer('role_id')->unsigned();

                $table->foreign('user_id')->references('id')->on('users')
                    ->onUpdate('cascade')->onUpdate('cascade');
                $table->foreign('role_id')->references('id')->on('roles')
                    ->onUpdate('cascade')->onUpdate('cascade');

                $table->primary(['user_id', 'role_id']);
            });

            // Create table for storing permissions
            Schema::create('permissions', function (Blueprint $table) {
                $table->increments('id');
                $table->string('name')->unique();
                $table->string('display_name')->nullable();
                $table->string('description')->nullable();
                $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
                $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            });

            // Create table for associating permissions to roles (Many-to-Many)
            Schema::create('permission_role', function (Blueprint $table) {
                $table->integer('permission_id')->unsigned();
                $table->integer('role_id')->unsigned();

                $table->foreign('permission_id')->references('id')->on('permissions')
                    ->onUpdate('cascade')->onUpdate('cascade');
                $table->foreign('role_id')->references('id')->on('roles')
                    ->onUpdate('cascade')->onUpdate('cascade');

                $table->primary(['permission_id', 'role_id']);
            });


            /*
                 * create default users
                 */
            DB::table('users')->insert([
                array('organization_id' => '2', 'avatar_url' => 'no_avatar.jpg', 'email' => 'admin@gmail.com', 'firstname' => 'Admin AmnetIot', 'lastname' => 'Admin AmnetIot', 'password' => bcrypt(123123), 'created_at' => date("Y-m-d H:i:s")),
                array('organization_id' => '2', 'avatar_url' => 'no_avatar.jpg', 'email' => 'manager1@gmail.com', 'firstname' => 'Manager AmnetIot', 'lastname' => 'Manager AmnetIot', 'password' => bcrypt(123456), 'created_at' => date("Y-m-d H:i:s")),
                array('organization_id' => '2', 'avatar_url' => 'no_avatar.jpg', 'email' => 'user1@gmail.com', 'firstname' => 'User AmnetIot', 'lastname' => 'User AmnetIot', 'password' => bcrypt(123456), 'created_at' => date("Y-m-d H:i:s")),
            ]);
            /*
             * create default permissions
             */
            DB::table('permissions')->insert([
                array('name' => 'view_dashboard', 'display_name' => 'view_dashboard'),
                array('name' => 'view_admin', 'display_name' => 'view_admin'),
                #####request permission
                array('name' => 'add_request', 'display_name' => 'add_request'),
                array('name' => 'edit_request', 'display_name' => 'edit_request'),
                array('name' => 'delete_request', 'display_name' => 'delete_request'),
                array('name' => 'view_request', 'display_name' => 'view_request'),
                #####customer permission
                array('name' => 'add_customer', 'display_name' => 'add_customer'),
                array('name' => 'edit_customer', 'display_name' => 'edit_customer'),
                array('name' => 'delete_customer', 'display_name' => 'delete_customer'),
                array('name' => 'view_customer', 'display_name' => 'view_customer'),
                #####category  permission
                array('name' => 'add_category', 'display_name' => 'add_category'),
                array('name' => 'edit_category', 'display_name' => 'edit_category'),
                array('name' => 'delete_category', 'display_name' => 'delete_category'),
                array('name' => 'view_category', 'display_name' => 'view_category'),


            ]);

            /*
              * create default roles
              */
            DB::table('roles')->insert([
                array('name' => 'administrators', 'display_name' => 'administrators'),
                array('name' => 'managers', 'display_name' => 'managers'),
                array('name' => 'users-viewers', 'display_name' => 'users-viewers'),
            ]);

            /*
             *  insert permissions and role
             */
            DB::table('permission_role')->insert([
                array('permission_id' => 1, 'role_id' => 1),
                array('permission_id' => 1, 'role_id' => 2),
                array('permission_id' => 1, 'role_id' => 3),

                array('permission_id' => 2, 'role_id' => 1),
                array('permission_id' => 2, 'role_id' => 2),
                array('permission_id' => 2, 'role_id' => 3),


                array('permission_id' => 3, 'role_id' => 1),
                array('permission_id' => 4, 'role_id' => 1),
                array('permission_id' => 5, 'role_id' => 1),
                array('permission_id' => 6, 'role_id' => 1),
                array('permission_id' => 7, 'role_id' => 1),
                array('permission_id' => 8, 'role_id' => 1),
                array('permission_id' => 9, 'role_id' => 1),
                array('permission_id' => 10, 'role_id' => 1),
                array('permission_id' => 11, 'role_id' => 1),
                array('permission_id' => 12, 'role_id' => 1),
                array('permission_id' => 13, 'role_id' => 1),
                array('permission_id' => 14, 'role_id' => 1),
            ]);

            /*
             *  assign user_id = 1 ( admin@gmail.com ) to role administrators AND others ..
             */
            DB::table('role_user')->insert([array('user_id' => 1, 'role_id' => 1),]);
            DB::table('role_user')->insert([array('user_id' => 2, 'role_id' => 2),]);
            DB::table('role_user')->insert([array('user_id' => 3, 'role_id' => 3),]);


            /**
             * user permission
             */
            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_user', 'display_name' => 'view_user'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 3));
            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'add_user', 'display_name' => 'add_user'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'edit_user', 'display_name' => 'edit_user'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'delete_user', 'display_name' => 'delete_user'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));


            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_user_for_managers', 'display_name' => 'view_user_for_managers'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'add_user_for_managers', 'display_name' => 'add_user_for_managers'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'edit_user_for_managers', 'display_name' => 'edit_user_for_managers'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'delete_user_for_managers', 'display_name' => 'delete_user_for_managers'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));

            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_user_for_users', 'display_name' => 'view_user_for_users'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 3));


            /**
             * role permission
             */
            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_role', 'display_name' => 'view_role'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'add_role', 'display_name' => 'add_role'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'edit_role', 'display_name' => 'edit_role'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'delete_role', 'display_name' => 'delete_role'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));

            /**
             * permission permission
             */
            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_permission', 'display_name' => 'view_permission'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'add_permission', 'display_name' => 'add_permission'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'edit_permission', 'display_name' => 'edit_permission'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'delete_permission', 'display_name' => 'delete_permission'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));


            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'export_csv', 'display_name' => 'export_csv'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));

            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'export_xls', 'display_name' => 'export_xls'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));


            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_avls_for_administrators', 'display_name' => 'view_avls_for_administrators'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));

            /*
             *  add excel permission
             */
            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'export_pdf', 'display_name' => 'export_pdf'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));

            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'import_user', 'display_name' => 'import_user'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));


            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'view_news_category', 'display_name' => 'view_news_category'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 2));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 3));
            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'add_news_category', 'display_name' => 'add_news_category'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'edit_news_category', 'display_name' => 'edit_news_category'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));
            $perm_id = DB::table('permissions')->insertGetId(array('name' => 'delete_news_category', 'display_name' => 'delete_news_category'));
            DB::table('permission_role')->insert(array('permission_id' => $perm_id, 'role_id' => 1));

        }

        /**
         * Reverse the migrations.
         *
         * @return  void
         */
        public function down()
        {
            Schema::drop('permission_role');
            Schema::drop('permissions');
            Schema::drop('role_user');
            Schema::drop('roles');
        }
    }
}
