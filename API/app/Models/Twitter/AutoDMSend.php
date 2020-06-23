<?php

namespace App\models\Twitter;

use Illuminate\Database\Eloquent\Model;

class AutoDMSend extends Model
{
    public $table = "twitter_direct_messages_send";

    protected $fillable = [
        "channel_id",
        "user_id",
        "send_message",
        "created_at",
        "updated_at"
    ];
}
