<?php

namespace App\Console\Commands\Twitter;

use Illuminate\Console\Command;
use App\Models\Twitter\Channel;
use Illuminate\Support\Facades\DB;
use Mail;
use App\Mail\WeeklyFourDaysAfterSignUp;
use App\Mail\WeeklySevenDaysAfterSignUp;
use App\Models\User;
use Carbon\Carbon;

class SyncEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync:emails';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronizes Emails';

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
        // start ad day 4 ,then send it Every week
        $afterFourday = Carbon::now()->subDays(4);
        $afterFourDayOfTheWeek = $afterFourday->dayOfWeek;
        $users = User::query()
            ->whereRaw("DAYOFWEEK(created_at)=?", [$afterFourDayOfTheWeek + 1])
            ->get();

        foreach ($users as $user) {
            $email = $user->email;
            $selectedChannel = $user->selectedTwitterChannel();

            $perPage = 3;
            $order = 'desc';
            $followingIds = $selectedChannel->followingIds()
                ->whereNull("unfollowed_at")
                ->orderBy("id", $order)
                ->paginate($perPage)
                ->pluck("user_id")
                ->toArray();

            $items = [];
            if(count($followingIds)){
                try{
                    $items = $selectedChannel->getUsersLookup($followingIds);
                }catch(\Exception $e){
                    return getErrorResponse($e, $selectedChannel->global);
                }
            }

            Mail::to($email)->send(new WeeklyFourDaysAfterSignUp($user, $items));
        }

        // start ad day 7 ,then send it Every week
        $today = Carbon::now();
        $dayOfTheWeek = $today->dayOfWeek;
        $weeklyUsers = User::query()
            ->whereRaw("DAYOFWEEK(created_at)=?", [$dayOfTheWeek + 1])
            ->get();

        foreach ($weeklyUsers as $user) {
            $email = $user->email;
            $selectedChannel = $user->selectedTwitterChannel();

            $perPage = 3;
            $feedIds = $selectedChannel->keywordTargetsFeed()
                ->inRandomOrder('123')
                ->paginate($perPage)
                ->pluck("user_id")
                ->toArray();

            $items = [];
            if (count($feedIds)) {
                try{
                    $items = $selectedChannel->getUsersLookup($feedIds);
                }catch(\Exception $e){
                    return getErrorResponse($e, $selectedChannel->global);
                }
            }

            Mail::to($email)->send(new WeeklySevenDaysAfterSignUp($user, $items));
        }
    }
}
