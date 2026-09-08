<?php

use Illuminate\Support\Env;

return [
    'connections' => [
        'pgsql' => [
            'driver' => 'pgsql',
            'host' => Env::get('DB_HOST', '127.0.0.1'),
            'port' => Env::get('DB_PORT', '5432'),
            'database' => Env::get('DB_DATABASE', 'amdern_properties'),
            'username' => Env::get('DB_USERNAME', 'amdern'),
            'password' => Env::get('DB_PASSWORD', 'amdern_password'),
            'charset' => 'utf8',
            'prefix' => '',
            'schema' => 'public',
            'sslmode' => 'prefer',
        ],
    ],
    'migrations' => [
        'table' => 'migrations',
        'path' => database_path('migrations'),
    ],
];