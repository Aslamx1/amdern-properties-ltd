<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;

class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return \Illuminate\Support\RateLimiting\RateLimiter::perMinute(60, $request->user()?->id ?: $request->ip());
        });
    }
}