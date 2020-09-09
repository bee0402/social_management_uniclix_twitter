<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScheduledEmail extends Model
{
    protected $fillable = [
        "user_id",
        "name",
        "email",
        "email_type",
        "send_at",
    ];
}
