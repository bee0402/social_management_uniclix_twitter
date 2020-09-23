<?php

namespace App\Console\Commands\Twitter;

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
        $channels = Channel::whereDoesntHave("processes", function ($q) {
            $q->where('process_name', 'SyncAutoDMs');
        })
            ->where("auto_dm", true)
            ->get();

        $action = route('sync.autodm.ids');

        $channelIds = array();

        foreach ($channels as $channel) {
            $channelIds[] = $channel->id;
        }

        multiRequest($action, $channelIds);
    }
}
