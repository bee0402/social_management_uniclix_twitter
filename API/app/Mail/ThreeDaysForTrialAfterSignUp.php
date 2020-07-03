<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class ThreeDaysForTrialAfterSignUp extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($user, $username)
    {
        $this->user = $user;
        $this->username = $username;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $user = $this->user->name;
        $username = $this->username;
        $delivery_time = $this->user->created_at->addHours(3 * 24 - 1);
        return $this->view('emails.user.three_days_for_trial_after_signup', [ 'user' => $user, 'username' => $username ])
            ->subject('Your FREE Trial ends today')
            ->withSwiftMessage(function ($message) use ($delivery_time) {
                $message->getHeaders()->addTextHeader('X-Mailgun-Deliver-By', $delivery_time->toRfc2822String());
            });;
    }
}
