<?php

use Illuminate\Support\Env;

return [
    'stateful' => explode(',', Env::get('SANCTUM_STATEFUL_DOMAINS', 'localhost,127.0.0.1')),
    'guard' => 'web',
    'expiration' => 43200,
    'token_prefix' => '',
    'middleware' => [
        'encrypt_cookies' => \App\Http\Middleware\EncryptCookies::class,
        'verify_csrf_token' => \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
        'substitute_bindings' => \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],
];