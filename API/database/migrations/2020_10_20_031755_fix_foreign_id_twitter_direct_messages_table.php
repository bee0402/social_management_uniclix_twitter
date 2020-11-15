<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class FixForeignIdTwitterDirectMessagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('twitter_direct_messages', function (Blueprint $table) {

            $table->dropForeign('twitter_direct_messages_channel_id_foreign');

            $table->foreign("channel_id")->references("id")->on("twitter_channels")->onDelete("cascade");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('twitter_direct_messages', function (Blueprint $table) {

            $table->dropForeign('twitter_direct_messages_channel_id_foreign');

            $table->foreign("channel_id")->references("channel_id")->on("twitter_channels")->onDelete("cascade");
        });    }
}
