<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Socialite\Facades\Socialite;
use Google_Client;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Socialite::extend('google', function ($app) {
            $config = $app['config']['services.google'];

            return Socialite::buildGoogleProvider(
                Google_Client::class,
                $config,
                $app['request']
            );
        });
    }
}