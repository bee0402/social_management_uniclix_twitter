<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class UserFirstSignUp extends Mailable
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
        return $this->view('emails.user.signupfirst', [ 'user' => $user ])
            ->subject('@' . $username . ' - Your Twitter Account Has Been Activated on Uniclix');
    }
}
