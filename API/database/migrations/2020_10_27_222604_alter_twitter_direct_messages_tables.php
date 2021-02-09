<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterTwitterDirectMessagesTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('twitter_direct_messages', function (Blueprint $table) {
            $table->string('message', 600)->change();
        });

        Schema::table('twitter_direct_messages_send', function (Blueprint $table) {
            $table->string('send_message', 600)->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //We can't change back the size to a smaller one.
    }
}
