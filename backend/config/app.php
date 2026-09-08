<?php

use Illuminate\Support\Env;

return [
    'name' => Env::get('APP_NAME', 'Amdern Properties Backend'),
    'env' => Env::get('APP_ENV', 'local'),
    'debug' => filter_var(Env::get('APP_DEBUG', true), FILTER_VALIDATE_BOOLEAN),
    'url' => Env::get('APP_URL', 'http://localhost:8000'),
    'asset_url' => Env::get('ASSET_URL'),
    'timezone' => 'Africa/Kampala',
    'locale' => 'en',
    'fallback_locale' => 'en',
    'key' => Env::get('APP_KEY'),
    'cipher' => 'AES-256-CBC',
    'fallback' => true,
    'providers' => [
        Illuminate\Foundation\Providers\ArtisanServiceProvider::class,
        Illuminate\Foundation\Providers\BroadcastServiceProvider::class,
        Illuminate\Foundation\Providers\BusServiceProvider::class,
        Illuminate\Foundation\Providers\EventServiceProvider::class,
        Illuminate\Foundation\Providers\ConsoleServiceProvider::class,
        Illuminate\Foundation\Providers\RateLimiterServiceProvider::class,
        Illuminate\Foundation\Providers\RebootServiceProvider::class,
        Illuminate\Foundation\Providers\RouteServiceProvider::class,
        App\Providers\AppServiceProvider::class,
        App\Providers\BroadcastServiceProvider::class,
        App\Providers\EventServiceProvider::class,
        App\Providers\RateLimiterServiceProvider::class,
        App\Providers\RouteServiceProvider::class,
        Spatie\Permission\PermissionServiceProvider::class,
        Laravel\Socialite\SocialiteServiceProvider::class,
        Laravel\Sanctum\SanctumServiceProvider::class,
    ],
];