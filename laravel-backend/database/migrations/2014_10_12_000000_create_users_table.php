<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Carbon\Carbon;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->increments('id');
            $table->string('firstname');
            $table->string('lastname')->nullable();
            $table->string('email')->nullable()->unique();
            $table->string('password', 60)->nullable();
            $table->string('avatar_url', 50)->nullable();
            $table->integer('organization_id')->nullable()->unsigned();
            $table->string('username', 30)->nullable();
            $table->string('timezone', 100)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('city', 250)->nullable();
            $table->timestamp('last_token_time')->nullable();
            $table->string('street', 250)->nullable();
            $table->string("phone")->nullable();
            $table->string('biography', 255)->nullable();
            $table->string('occupation', 255)->nullable();
            $table->string('website', 255)->nullable();
            $table->string('image', 255)->nullable();
            $table->date('birthday')->nullable();
            $table->tinyInteger('gender')->nullable();
            $table->string('blood_type', 3)->nullable();
            $table->integer('status')->nullable()->default(0);
            $table->rememberToken();
            $table->timestamp('last_message_time')->useCurrent()->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('users');
    }
}
