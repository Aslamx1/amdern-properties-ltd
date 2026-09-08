<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends DatabaseSeeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        $adminRole = Role::where('name', 'Admin')->first();
        $admin = User::updateOrCreate(
            ['email' => 'admin@amdernproperties.com'],
            [
                'name' => 'Amdern Admin',
                'password' => Hash::make('admin123'),
                'phone' => '+256700000000',
                'user_type' => 'admin',
                'email_verified_at' => now(),
                'role_id' => $adminRole->id,
                'is_active' => true,
            ]
        );

        // Create estate agent user
        $agentRole = Role::where('name', 'Estate Agent')->first();
        $agent = User::updateOrCreate(
            ['email' => 'agent@amdernproperties.com'],
            [
                'name' => 'John Mukiibi',
                'password' => Hash::make('agent123'),
                'phone' => '+256701234567',
                'user_type' => 'agent',
                'email_verified_at' => now(),
                'role_id' => $agentRole->id,
                'is_active' => true,
            ]
        );

        // Create property developer user
        $developerRole = Role::where('name', 'Property Developer')->first();
        $developer = User::updateOrCreate(
            ['email' => 'developer@amdernproperties.com'],
            [
                'name' => 'Sarah Nalwoga',
                'password' => Hash::make('developer123'),
                'phone' => '+256702345678',
                'user_type' => 'developer',
                'email_verified_at' => now(),
                'role_id' => $developerRole->id,
                'is_active' => true,
            ]
        );

        // Create property owner user
        $ownerRole = Role::where('name', 'Property Owner')->first();
        $owner = User::updateOrCreate(
            ['email' => 'owner@amdernproperties.com'],
            [
                'name' => 'David Kato',
                'password' => Hash::make('owner123'),
                'phone' => '+256703456789',
                'user_type' => 'owner',
                'email_verified_at' => now(),
                'role_id' => $ownerRole->id,
                'is_active' => true,
            ]
        );

        // Create property seeker user
        $seekerRole = Role::where('name', 'Property Seeker')->first();
        $seeker = User::updateOrCreate(
            ['email' => 'seeker@amdernproperties.com'],
            [
                'name' => 'Maria Nakato',
                'password' => Hash::make('seeker123'),
                'phone' => '+256704567890',
                'user_type' => 'seeker',
                'email_verified_at' => now(),
                'role_id' => $seekerRole->id,
                'is_active' => true,
            ]
        );
    }
}