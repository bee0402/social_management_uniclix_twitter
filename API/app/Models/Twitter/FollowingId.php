<?php

namespace App\Models\Twitter;

use Illuminate\Database\Eloquent\Model;

use DB;

class FollowingId extends Model
{
    public $table = "twitter_following_ids";
    protected $fillable = [
        "channel_id",
        "user_id",
        "unfollowed_at",
        "unfollowed_you_at",
        "created_at",
        "updated_at",
        "trial_status"
    ];

    public static function deleteInactiveUsers()
    {
        $ids = DB::table('twitter_channels')
            ->join('users', 'twitter_channels.user_id', '=', 'users.id')
            ->where('users.active', false)
            ->pluck('twitter_channels.id')
            ->toArray();

        DB::table('twitter_following_ids')->whereIn('channel_id', $ids)->delete();
    }
}
