<?php

use Illuminate\Support\Env;

return [
    'default' => 'stack',
    'channels' => [
        'stack' => [
            'driver' => 'single',
            'path' => storage_path('logs/laravel.log'),
            'level' => Env::get('LOG_LEVEL', 'debug'),
        ],
        'daily' => [
            'driver' => 'daily',
            'path' => storage_path('logs/laravel.log'),
            'level' => Env::get('LOG_LEVEL', 'debug'),
            'days' => 14,
        ],
        'slack' => [
            'driver' => 'slack',
            'url' => Env::get('LOG_SLACK_WEBHOOK_URL'),
            'level' => 'critical',
        ],
    ],
];