<?php

namespace App\Console\Commands\Twitter;

use Carbon\Carbon;
use Illuminate\Console\Command;
use App\Models\Twitter\Channel;

use DB;

class SyncFollowerIds extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync:follower.ids';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronizes Follower ids';

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
        $channelIds = \DB::table('twitter_channels')
//            ->join('users', 'twitter_channels.user_id', '=', 'users.id')
            ->join('channels', 'twitter_channels.channel_id', '=', 'channels.id')
            ->whereNotExists(function($query)
            {
                $query->select(DB::raw(1))
                    ->from('twitter_processes')
                    ->whereRaw('twitter_channels.id = twitter_processes.channel_id')
                    ->where('process_name', 'syncFollowerIds');
            })
//            ->where('users.trial_ends_at', '>', Carbon::now())
            ->where('channels.active', true)
            ->groupBy('twitter_channels.id')
            ->pluck('twitter_channels.id')
            ->toArray();

        $action = route('sync.follower.ids');

        multiRequest($action, $channelIds);
    }
}
