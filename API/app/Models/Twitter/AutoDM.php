<?php

namespace App\Models\Twitter;

use Illuminate\Database\Eloquent\Model;

class AutoDM extends Model
{
    public $table = "twitter_direct_messages";

    protected $fillable = ["channel_id", "message", "source", "active","created_at", "updated_at"];

}
