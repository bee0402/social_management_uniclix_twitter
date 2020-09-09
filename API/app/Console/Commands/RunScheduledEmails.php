<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ScheduledEmail;
use App\Models\Twitter\Channel;
use Carbon\Carbon;
use Mail;
use App\Mail\UserFirstSignUp;
use App\Mail\OneDayForTrialAfterSignUp;
use App\Mail\OneDayForAutoDMAfterSignUp;
use App\Mail\ThreeDaysForTrialAfterSignUp;
use App\Mail\SixDaysForTrialAfterSignUp;

class RunScheduledEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'run:emails';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publish the scheduled emails';

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
        $scheduledEmails = ScheduledEmail::where('send_at', '<=', Carbon::now())
            ->get();

        foreach ($scheduledEmails as $scheduledEmail) {
            $channel = Channel::where('user_id', $scheduledEmail->user_id)->first();

            if ($channel != null) {
                switch ($scheduledEmail->email_type) {
                    case 'SignUpFirst':
                        Mail::to($scheduledEmail->email)->send(new UserFirstSignUp($scheduledEmail, $channel->username));
                        break;
                    case 'OneDayTrial':
                        Mail::to($scheduledEmail->email)->send(new OneDayForTrialAfterSignUp($scheduledEmail, $channel->username));
                        break;
                    case 'OneDayAutoDM':
                        Mail::to($scheduledEmail->email)->send(new OneDayForAutoDMAfterSignUp($scheduledEmail));
                        break;
                    case 'ThreeDaysTrial':
                        Mail::to($scheduledEmail->email)->send(new ThreeDaysForTrialAfterSignUp($scheduledEmail, $channel->username));
                        break;
                    case 'SixDaysTrial':
                        Mail::to($scheduledEmail->email)->send(new SixDaysForTrialAfterSignUp($scheduledEmail));
                }

                ScheduledEmail::where('id', $scheduledEmail->id)->delete();
            }
        }
    }
}
