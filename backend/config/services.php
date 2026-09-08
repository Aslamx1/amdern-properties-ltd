<?php

use Illuminate\Support\Env;

return [
    'google' => [
        'client_id' => Env::get('GOOGLE_CLIENT_ID'),
        'client_secret' => Env::get('GOOGLE_CLIENT_SECRET'),
        'redirect' => Env::get('GOOGLE_REDIRECT_URI'),
    ],
];