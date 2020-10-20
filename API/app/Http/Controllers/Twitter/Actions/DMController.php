<?php

namespace App\Http\Controllers\Twitter\Actions;

use App\Models\Twitter\Channel;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Twitter\AutoDM;

class DMController extends Controller
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
    public function DM(Request $request)
    {
        try {
            $content = $request->input('content');
            $userId = $request->input('userId');

            $channelId = $request->input('channelId');

            if ($channelId) {
                $channel = $this->user->getChannel($channelId);
                $channel = $channel->details;
            } else {
                $channel = $this->selectedChannel;
            }

            if ($content && $userId) {
                $channel->DM($userId, $content);
                return response()->json(["success" => true, "message" => "DM posted successfully"]);
            }

            return response()->json(["success" => false, "message" => "No text or screen_name provided"], 400);
        } catch (\Exception $e) {
            return response()->json(["success" => false, "message" => "You can not DM this user."], 400);
        }

        return response()->json(["success" => false, "message" => "Tweet cannot be empty"], 304);
    }



    public function activateADM(Request $request)
    {
        try {
            $channel = $this->selectedChannel;

            $status = $request->input('status');

            if ($channel) {
                $channel->auto_dm = 1;
                $channel->save();
                return response()->json(["success" => true, "message" => "Auto DM activated successfully"]);
            }

            return response()->json(["success" => false, "message" => "No status or wrong channel id provided"], 400);
        } catch (\Exception $e) {
            return response()->json([
                "success" => false,
                "message" => "You can not activated Auto DM in this account.",
                "errorMessage" => $e->getMessage()
            ], 400);
        }
    }

    public function saveResponses(Request $request)
    {
        $user = auth()->user();
        try {
            $channelId = $request->input('channelId');
            $channel   = Channel::where('channel_id', $channelId)->first();
            $message   = $request->input('message');

            if ($channel && $channel->user_id = $user->id) {
                try {
                    AutoDM::where('channel_id', $channelId)->delete();
                } catch (\Exception $e) {
                    //throw $th;
                }
                $autoDm = new AutoDM();
                $autoDm->channel_id = $channel->id;
                $autoDm->active = true;
                $autoDm->message = $message;
                $autoDm->save();
                return response()->json(["success" => true, "message" => "Auto response message is saved successfully!"]);
            }

            return response()->json(["success" => false, "message" => "No status or wrong channel id provided"], 400);
        } catch (\Exception $e) {
            return response()->json(["success" => false, "message" => $e->getMessage()], 400);
        }
    }

    public function getMyAutoDm()
    {
        try {
            $channel = $this->selectedChannel;
            $date = AutoDM::where("channel_id", $channel->id)
                ->select("message", "active", "id")
                ->orderBy('id', 'desc')
                ->get();

            return response()->json(["success" => $channel->channel_id, "data" => $date]);
        } catch (\Exception $e) {
            return response()->json(["success" => false, "message" => "You can not save auto response in this account."], 400);
        }
    }
}
