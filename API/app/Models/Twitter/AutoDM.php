<?php

namespace App\Models\Twitter;

use Illuminate\Database\Eloquent\Model;

use DB;

class AutoDM extends Model
{
    public $table = "twitter_direct_messages";

    protected $fillable = ["channel_id", "message", "source", "active","created_at", "updated_at"];

    public static function updateTable()
    {
        \DB::table('twitter_direct_messages')->where('active', false)->delete();

        \DB::table('twitter_direct_messages')
            ->join('twitter_channels', 'twitter_direct_messages.channel_id', '=', 'twitter_channels.channel_id')
            ->update(['twitter_direct_messages.channel_id' => DB::raw("twitter_channels.id")]);
    }

}
