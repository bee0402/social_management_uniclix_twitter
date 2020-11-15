<?php

namespace App\Models\Twitter;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Process extends Model
{
    public $table = "twitter_processes";
    protected $fillable = ["channel_id", "process_name", "created_at", "updated_at"];

    public static function clearOldProcesses()
    {
        \DB::table('twitter_processes')
            ->where('updated_at', '<', Carbon::now()->subWeek())
            ->delete();
    }
}
