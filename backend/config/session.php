<?php

use Illuminate\Support\Env;

return [
    'driver' => 'session',
    'lifetime' => 120,
    'path' => '/',
    'domain' => null,
    'secure' => false,
    'http_only' => true,
    'same_site' => 'lax',
];