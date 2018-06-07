<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAssetsResourceRelations extends Migration
{
    public function up()
    {
        Schema::create('assets_resources_relations', function (Blueprint $table) {
            $table->increments('id');
            $table->string('asset_type', 50)->nullable();
            //     $table->integer('asset_id')->nullable()->unsigned();
            $table->integer('assets_vehicle_id')->nullable()->unsigned();
            $table->integer('assets_person_id')->nullable()->unsigned();
            $table->integer('assets_resource_id')->nullable()->unsigned();
            $table->string('imei', 30)->nullable();
            $table->foreign('assets_resource_id')->references('id')->on('assets_resources')->onUpdate('cascade');
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('deleted_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            //   $table->index('asset_id');
            $table->index('assets_vehicle_id');
            $table->index('assets_person_id');
            $table->foreign('assets_vehicle_id')->references('id')->on('assets_vehicles')->onUpdate('cascade');
            $table->foreign('assets_person_id')->references('id')->on('assets_persons')->onUpdate('cascade');
            //   $table->unique('assets_resource_id');
        });
    }

    public function down()
    {
        Schema::drop('assets_resources_relations');
    }
}
