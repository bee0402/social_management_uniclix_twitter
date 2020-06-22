<?php

namespace App\Http\Controllers\Twitter\Actions;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class FollowController extends Controller
{
    private $user;
    private $selectedChannel;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = auth()->user();
            $this->selectedChannel = $this->user->selectedTwitterChannel();
            return $next($request);
        });
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function follow($userId)
    {

        try{
            if($userId){

                if($this->user->getLimit("twitter_daily_follows") > $this->selectedChannel->getDailyStatisticsFor("follows")){

                    $userCreatedAt = $this->selectedChannel->user()
                        ->pluck("created_at")
                        ->toArray();
                    $trialTimeLimit = $userCreatedAt[0]->addDays(1);

                    if ($this->selectedChannel->paid == 0 && Carbon::now()->greaterThan($trialTimeLimit)) {
                        return response()->json(["success" => false, "message" => "You exceeded the time limit.", "trialLimit" => true], 200);
                    }

                    if ($this->selectedChannel->paid == 0 && $this->selectedChannel->following_count == 10) {
                        return response()->json(["success" => false, "message" => "You exceeded the following limit.", "trialLimit" => true], 200);
                    }

                    $twitterUser = $this->selectedChannel->followByName($userId);

                    $this->selectedChannel->followingIds()
                        ->updateOrCreate(
                            [
                                "channel_id" => $this->selectedChannel->id,
                                "user_id" => $twitterUser->id
                            ],
                            [
                                "unfollowed_at" => null,
                                "created_at" => Carbon::now(),
                                "updated_at" => Carbon::now()
                            ]);

                    if ($this->selectedChannel->paid == 0 && $this->selectedChannel->following_count < 10) {
                        $this->selectedChannel
                            ->where("channel_id", $this->selectedChannel->channel_id)
                            ->update(["following_count" => $this->selectedChannel->following_count + 1]);
                    }

                    $this->selectedChannel->updateStatistics("follows");
                    $follows = $this->selectedChannel->getDailyStatisticsFor("follows");

                    return response()->json(["success" => true, "message" => "You followed $twitterUser->screen_name.", "dailyActions" => $follows, "trialLimit" => false], 200);
                }

                return response()->json(["success" => false, "message" => "You exceeded the daily limit.", "trialLimit" => false], 403);
            }
        }catch(\Exception $e){
            return response()->json(["success" => false, "message" => $e->getMessage(), "trialLimit" => false], 500);
        }

        return response()->json(["success" => false, "message" => "Unknown user id", "trialLimit" => false], 304);
    }
}