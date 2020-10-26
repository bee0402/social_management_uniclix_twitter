<?php

namespace App\Models\Twitter;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

use DB;

class FollowerId extends Model
{
    public $table = "twitter_follower_ids";
    protected $fillable = [
        "channel_id",
        "user_id",
        "send_message",
        "unfollowed_at",
        "unfollowed_you_at",
        "created_at",
        "updated_at"
    ];

    public static function deleteInactiveUsers()
    {
        $ids = DB::table('twitter_channels')
            ->join('users', 'twitter_channels.user_id', '=', 'users.id')
            ->where('users.active', false)
            ->pluck('twitter_channels.id')
            ->toArray();

        DB::table('twitter_follower_ids')->whereIn('channel_id', $ids)->delete();
    }
}
