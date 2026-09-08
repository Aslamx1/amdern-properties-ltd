<?php

namespace App\Listeners;

use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendPasswordResetNotification implements ShouldQueue
{
    public function handle(PasswordReset $event): void
    {
        // Log password reset event
        \Illuminate\Support\Facades\Log::info('Password reset completed', [
            'user_id' => $event->user->id,
            'email' => $event->user->email,
        ]);
    }
}