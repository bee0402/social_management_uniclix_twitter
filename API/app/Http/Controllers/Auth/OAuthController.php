<?php

namespace App\Http\Controllers\Auth;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Mail;
use App\Mail\OneDayForTrialAfterSignUp;
use App\Mail\OneDayForAutoDMAfterSignUp;
use App\Mail\ThreeDaysForTrialAfterSignUp;
use App\Mail\SixDaysForTrialAfterSignUp;
use App\Models\ScheduledEmail;

class OAuthController extends Controller
{
    private $emailTypes;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
        $this->emailTypes = array(
            "SignUpFirst",
            "OneDayTrial",
            "OneDayAutoDM",
            "ThreeDaysTrial",
            "SixDaysTrial",
        );
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return \App\User
     */
    protected function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors'=>$validator->errors()], 400);
        }

        $role = Role::first();
        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'role_id' => $role->id,
            'trial_ends_at' => Carbon::now()->addDays($role->trial_days),
            'password' => Hash::make($request->input('password')),
        ]);

        $email = $request->input('email');
        $user_register = User::where('email', $email)->first();

        $created_at = strtotime($user_register['created_at']);

        // $user->notify(new \App\Notifications\User\UserSignUp());

        foreach ($this->emailTypes as $emailType) {
            $send_at = $this->getSendTime($created_at, $emailType);

            ScheduledEmail::create([
                'user_id' => $user->id,
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'email_type' => $emailType,
                'send_at' => $send_at,
            ]);
        }

        return response()->json($user->createToken("Password Token"));
    }

    protected function login(Request $request)
    {
        $email = $request->input('email');
        $password = $request->input('password');

        $user = User::where('email', $email)->first();

        if(!$user || !Hash::check($password, $user->password)) return response()->json(["error" => "Incorrect email or password."], 404);

        return response()->json($user->createToken("Password Token"));
    }

    private function getSendTime($created_at, $emailType) {
        switch ($emailType) {
            case 'SignUpFirst':
                $result = date("Y-m-d H:i:s", $created_at);
                break;
            case 'OneDayTrial':
                $result = date("Y-m-d H:i:s", $created_at + 24 * 3600);
                break;
            case 'OneDayAutoDM':
                $result = date("Y-m-d H:i:s", $created_at + 1 * 24 * 3600);
                break;
            case 'ThreeDaysTrial':
                $result = date("Y-m-d H:i:s", $created_at + 3 * 24 * 3600);
                break;
            case 'SixDaysTrial':
                $result = date("Y-m-d H:i:s", $created_at + 6 * 24 * 3600);
        }

        return $result;
    }
}
