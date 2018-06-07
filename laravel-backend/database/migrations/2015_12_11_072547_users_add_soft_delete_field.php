<?php

namespace {

    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Database\Migrations\Migration;

    class UsersAddSoftDeleteField extends Migration
    {
        public function up()
        {
            Schema::table('users', function ($table) {

                $table->softDeletes();
            });
        }

        public function down()
        {
            //
        }
    }
}
