<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTablesRelations extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                $table->foreign('organization_id')->references('id')->on('organizations')->onUpdate('cascade');
            });
        }

        if (Schema::hasTable('assets_persons')) {
            Schema::table('assets_persons', function (Blueprint $table) {
                $table->foreign('organization_id')->references('id')->on('organizations')->onUpdate('cascade');
                $table->foreign('default_point_of_interest')->references('id')->on('points_of_interests')->onUpdate('cascade');
            });
        }

        if (Schema::hasTable('assets_vehicles')) {
            Schema::table('assets_vehicles', function (Blueprint $table) {
                $table->foreign('organization_id')->references('id')->on('organizations')->onUpdate('cascade');
                $table->foreign('night_parking_lot')->references('id')->on('points_of_interests')->onUpdate('cascade');
            });
        }

        if (Schema::hasTable('assets_resources')) {
            Schema::table('assets_resources', function (Blueprint $table) {
                $table->foreign('organization_id')->references('id')->on('organizations')->onUpdate('cascade');
            });
        }

        if (Schema::hasTable('avl_track')) {
            Schema::table('avl_track', function (Blueprint $table) {
                $table->foreign('resource_id')->references('id')->on('assets_resources')->onUpdate('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
