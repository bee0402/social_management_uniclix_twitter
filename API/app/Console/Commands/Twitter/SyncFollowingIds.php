<?php

namespace App\Console\Commands\Twitter;

use Carbon\Carbon;
use Illuminate\Console\Command;
use App\Models\Twitter\Channel;

use DB;

class SyncFollowingIds extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync:following.ids';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronizes Following ids';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $channelIds = DB::table('twitter_channels')
            ->join('users', 'twitter_channels.user_id', '=', 'users.id')
            ->join('channels', 'twitter_channels.channel_id', '=', 'channels.id')
            ->whereNotExists(function($query)
            {
                $query->select(DB::raw(1))
                    ->from('twitter_processes')
                    ->whereRaw('twitter_channels.id = twitter_processes.channel_id')
                    ->where('process_name', 'syncFollowingIds');
            })
            ->where('users.active', true)
            ->where('channels.active', true)
            ->groupBy('twitter_channels.id')
            ->pluck('twitter_channels.id')
            ->toArray();

        $action = route('sync.following.ids');

        multiRequest($action, $channelIds);
    }
}
