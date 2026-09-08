<?php

use Illuminate\Support\Env;

return [
    'driver' => 'file',
    'store' => 'file',
    'prefix' => 'laravel_',
    'path' => storage_path('framework/cache'),
    'lock_path' => storage_path('framework/cache/data'),
    'directory' => storage_path('framework/cache/data'),
];