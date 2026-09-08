<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Migrations\Seed;
use Illuminate\Database\Seeders\RolePermissionSeeder as SpatieRolePermissionSeeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeders\DatabaseSeeder;

class RoleSeeder extends DatabaseSeeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Property Seeker',
                'guard_name' => 'web',
                'description' => 'User who can search and inquire about properties',
            ],
            [
                'name' => 'Property Owner',
                'guard_name' => 'web',
                'description' => 'User who owns properties and can list them',
            ],
            [
                'name' => 'Estate Agent',
                'guard_name' => 'web',
                'description' => 'Real estate agent who can manage property listings',
            ],
            [
                'name' => 'Property Developer',
                'guard_name' => 'web',
                'description' => 'Developer who can list new properties and developments',
            ],
            [
                'name' => 'Admin',
                'guard_name' => 'web',
                'description' => 'Administrator with full system access',
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']],
                $role
            );
        }
    }
}