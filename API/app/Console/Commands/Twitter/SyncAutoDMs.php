<?php

namespace App\Console\Commands\Twitter;

use Carbon\Carbon;
use Illuminate\Console\Command;
use App\Models\Twitter\Channel;

use DB;

class SyncAutoDMs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync:autodm.ids';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send automatic direct messages ids';

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
            ->join('twitter_follower_ids', 'twitter_follower_ids.channel_id', '=', 'twitter_channels.id')
            ->join('twitter_direct_messages', 'twitter_direct_messages.channel_id', '=', 'twitter_channels.id')
            ->whereNotExists(function($query)
            {
                $query->select(DB::raw(1))
                    ->from('twitter_processes')
                    ->whereRaw('twitter_channels.id = twitter_processes.channel_id')
                    ->where('process_name', 'SyncAutoDMs');
            })
//            ->where('users.trial_ends_at', '>', Carbon::now())
            ->where('channels.active', true)
            ->where('twitter_channels.auto_dm', true)
            ->where('twitter_follower_ids.send_message', false)
            ->where('twitter_direct_messages.active', true)
            ->whereNull('twitter_follower_ids.unfollowed_you_at')
            ->groupBy('twitter_channels.id')
            ->pluck('twitter_channels.id')
            ->toArray();

        $action = route('sync.autodm.ids');

        multiRequest($action, $channelIds);
    }
}
