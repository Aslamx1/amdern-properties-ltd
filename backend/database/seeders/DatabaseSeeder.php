<?php

namespace Database\Seeders;

use Illuminate\Database\Seeders\DatabaseSeeder as BaseDatabaseSeeder;

class DatabaseSeeder extends BaseDatabaseSeeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            PropertySeeder::class,
        ]);
    }
}