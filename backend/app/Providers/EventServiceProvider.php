<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        \Illuminate\Auth\Events\Login::class => [
            \App\Listeners\UpdateLastLogin::class,
        ],
        \Illuminate\Auth\Events\PasswordReset::class => [
            \App\Listeners\SendPasswordResetNotification::class,
        ],
    ];

    public function boot(): void
    {
        //
    }
}