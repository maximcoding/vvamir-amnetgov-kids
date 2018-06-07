<?php

namespace {

    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Database\Migrations\Migration;

    class UsersCreateTableRoutePermission extends Migration
    {
        public function up()
        {
            Schema::create('route_permission', function (Blueprint $table) {
                $table->increments('id');
                $table->string('route')->unique();
                $table->string('permissions')->nullable();
                $table->string('roles')->nullable();
                $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
                $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            });
        }

        public function down()
        {
            Schema::drop('route_permission');
        }
    }

}
