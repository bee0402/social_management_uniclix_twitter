<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use App\Models\Role;
use App\Models\RoleAddon;
use App\Models\Twitter\Channel;
use Carbon\Carbon;
use Illuminate\Http\Request;

class BillingController extends Controller
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
            $this->selectedChannel = $this->user->selectedChannel();
            return $next($request);
        });
    }

    /**
     * Get all billing plans
     *
     */
    public function getPlans()
    {
        $plans = Role::all();
        $currentPLan = $this->user->role_id;
        $activeSubscription = $this->user->subscribed('main');
        $onGracePeriod = $this->user->subscribed('main') ? $this->user->subscription('main')->onGracePeriod() : false;
        $addon = $this->user->subscribed('addon') ? $this->user->subscription('addon') : null;
        $activeAddon = $this->user->subscribed('addon');
        $addonOnGracePeriod = $this->user->subscribed('addon') ? $this->user->subscription('addon')->onGracePeriod() : false;

        $subscription = [
            "currentPlan" => $currentPLan,
            "activeSubscription" => $activeSubscription,
            "onGracePeriod" => $onGracePeriod,
        ];

        $addon = [
            "addon" => $addon,
            "activeAddon" => $activeAddon,
            "addonOnGracePeriod" => $addonOnGracePeriod,
        ];

        return ["plans" => $plans, "subscription" => $subscription, "addon" => $addon];
    }

    public function getPlanData()
    {
        $allPlans = Role::formattedForDisplay();
        $paidPlans = Role::where("name", "!=", "free")->formattedForDisplay();
        $addon = RoleAddon::first();
        return compact('allPlans', 'paidPlans', 'addon');
    }

    public function createSubscription(Request $request)
    {
        $token = $request->input('token');
        $plan = $token['plan'];
        $trialDays = $token['trialDays'];
        $subType = $token['subType'];
        $id = $token['id'];
        $user_card_data = $token['user_card_data'];
        $user = $this->user;
        $newUsers = Channel::where('user_id', $user->id)->where("paid", false)->count();
        
        try {
            if ($newUsers > 0) {
                if ($trialDays != "0") {
                    $user->newSubscription($subType, $plan)->trialDays($trialDays)->quantity($newUsers)->create($id);
                } else {
                    $user->newSubscription($subType, $plan)->quantity($newUsers)->create($id);
                }
            }
            // if ($newUsers > 0) {
            //     $user->subscription('main')->incrementQuantity($newUsers);
            // }

            $roleName = $plan;
            
            if ($subType == "main") {
                $role = Role::where("name", $roleName)->first();
                if (!$role) {
                    return response()->json(["error" => "Plan not found"], 404);
                }

                $user->role_id = $role->id;
                $user->save();
                Channel::where('user_id', $user->id)->update(["paid" => true]);

                return response()->json(["success" => true], 200);
            } elseif ($subType == "addon") {

                $roleAddon = RoleAddon::where("name", $plan)->first();
                if (!$roleAddon) {
                    return response()->json(["error" => "Addon not found"], 404);
                }

                $user->roleAddons()->attach($roleAddon->id);

                return response()->json(["success" => true], 200);
            }

            $user->user_card_data = $user_card_data;
            $user->save();
        } catch (\Throwable $th) {
            return response()->json(["error" => $th->getMessage()], 500);
        }
    }
    public function updateSubscription(Request $request)
    {
        $user = $this->user;
        $users = Channel::where('user_id', $user->id)->count();
        try {
            $user->subscription('main')->updateQuantity($users);

            $users = Channel::where('user_id', $user->id)
                ->update(["paid" => true]);
            return response()->json(["success" => true], 200);
        } catch (\Throwable $th) {
            return response()->json(["error" => $th->getMessage()], 500);
        }
    }


    public function cancelSubscription()
    {
        try {
            $user = $this->user;

            $user->subscription('main')->cancel();
            Channel::where('user_id', $user->id)->update(["paid" => false]);

            return response()->json(["success" => true], 200);
        } catch (\Throwable $th) {
            return response()->json(["error" => "Something went wrong!"], 404);
        }
    }

    public function resumeSubscription(Request $request)
    {
        try {
            $user = $this->user;

            $user->subscription('main')->resume();
            Channel::where('user_id', $user->id)->update(["paid" => true]);

            return response()->json(["success" => true], 200);
        } catch (\Throwable $th) {
            return response()->json(["error" => "Something went wrong!"], 404);
        }
    }

    public function changePlan(Request $request)
    {

        $plan = $request->input('plan');
        $roleName = explode("_", $plan)[0];
        $role = Role::where("name", $roleName)->first();
        if (!$role) {
            return response()->json(["error" => "Plan not found"], 404);
        }

        $user = $this->user;
        if ($user->channels()->count() > $role->roleLimit->account_limit) {
            return response()->json(["error" => "Please delete some social accounts to correspond to the limits of your new plan.", "redirect" => "/accounts"], 403);
        }

        if ($user->teamMembers()->count() + 1 > $role->roleLimit->team_accounts) {
            return response()->json(["error" => 'Please delete some team accounts to correspond to the limits of your new plan.', "redirect" => "/settings/team"], 403);
        }

        if ($plan !== 'free') {
            $user->subscription('main')->swap($plan);
        } else {
            $user->subscription('main')->cancel();
        }

        $user->role_id = $role->id;
        $user->save();

        return response()->json(["success" => true], 200);
    }

    public function activateAddon(Request $request)
    {
        $addon = $request->input('addon');
        $roleAddon = RoleAddon::where("name", $addon)->first();
        if (!$roleAddon) {
            return response()->json(["error" => "Addon not found"], 404);
        }

        $user = $this->user;
        $user->roleAddons()->attach($roleAddon->id);

        $userAddon = \DB::table('user_role_addons')->where("addon_id", $roleAddon->id)->where("user_id", $user->id)->first();

        if ($userAddon && is_null($userAddon->trial_ends_at) && !$user->subscribed("addon")) {
            \DB::table('user_role_addons')->where("addon_id", $roleAddon->id)->where("user_id", $user->id)->update(["trial_ends_at" => Carbon::now()->addDays($roleAddon->trial_days)]);
        }

        return response()->json(["success" => true], 200);
    }

    public function cancelAddon(Request $request)
    {
        try {
            $user = $this->user;

            $user->subscription('addon')->cancel();

            $addon = $request->input('addon');
            $roleAddon = RoleAddon::where("name", $addon)->first();
            if (!$roleAddon) {
                return response()->json(["error" => "Addon not found"], 404);
            }

            $user = $this->user;
            $user->roleAddons()->detach($roleAddon->id);

            return response()->json(["success" => true], 200);

            return response()->json(["success" => true], 200);
        } catch (\Throwable $th) {
            return response()->json(["error" => "Something went wrong!"], 500);
        }
    }

    public function editCard(Request $request)
    {
        $token = $request->input('token');
        $id = $token['id'];
        $user_card_data = $token['user_card_data'];
        $user = $this->user;
        try {
            $user->updateCard($id);

            $user->user_card_data = $user_card_data;
            $user->save();
            return response()->json(["success" => true], 200);
        } catch (\Throwable $th) {
            return response()->json(["error" => $th->getMessage()], 500);
        }
    }

    public function getCoupon(Request $request)
    {
        $client = new Client(['base_uri' => 'https://api.stripe.com']);

        //We fetch that particular discount.
        try{

            $response = $client->request('GET', '/v1/coupons/' . $request->id, [
                'headers' => ['Authorization' => 'Bearer ' . env('STRIPE_SECRET')]
            ]);

            if($response->getStatusCode() == 200){

                $content = json_decode($response->getBody()->getContents());

                //I return the discount, so we may properly add it to the payment
                return response()->json(["discount" => $content->percent_off], 200);
            }

            return response()->json(["discount" => null], 200);

        }catch (\Exception $e){
            \Log::info('Coupon validation error: ' . $e->getMessage());

            return response()->json(["discount" => null], 200);
        }
    }
}
