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

class OAuthController extends Controller
{

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
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

        // $user->notify(new \App\Notifications\User\UserSignUp());

        Mail::to($email)->send(new OneDayForAutoDMAfterSignUp($user));
        Mail::to($email)->send(new SixDaysForTrialAfterSignUp($user));

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
}
