<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Http\Controllers\Controller;

class WeeklyFourDaysAfterSignUp extends Mailable
{
    use Queueable, SerializesModels;
    private $user;
    private $selectedChannel;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($user, $items)
    {
        $this->user = $user;
        $this->items = $items;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $user = $this->user->name;
        $items = $this->items;
        return $this->view('emails.user.weekly_four_days_after_signup', [ 'user' => $user, 'items' => $items ])
            ->subject('Here is a list of your inactive Twitter users you follow');
    }
}
