<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Enable PostGIS extension
        DB::statement('CREATE EXTENSION IF NOT EXISTS postgis');

        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('guard_name')->default('web');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->string('phone')->nullable();
            $table->string('user_type')->nullable(); // seeker, owner, agent, developer
            $table->string('google_id')->nullable()->index();
            $table->string('avatar')->nullable();
            $table->rememberToken();
            $table->foreignId('role_id')->nullable()->constrained('roles')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Create properties table with PostGIS geography column
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique()->nullable();
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->string('currency', 3)->default('UGX');
            $table->enum('listing_type', ['for_sale', 'for_rent']);
            $table->enum('property_type', ['apartment', 'house', 'land', 'commercial']);
            $table->integer('bedrooms')->default(0);
            $table->integer('bathrooms')->default(0);
            $table->boolean('is_verified')->default(false);
            $table->enum('status', ['active', 'pending', 'sold'])->default('active');
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('district')->nullable();
            $table->jsonb('amenities')->nullable();
            $table->timestamps();
        });

        // Add PostGIS geography column using raw SQL
        DB::statement('ALTER TABLE properties ADD COLUMN location geography(POINT, 4326)');

        // Add indexes
        DB::statement('CREATE INDEX idx_properties_listing_type_property_type ON properties(listing_type, property_type)');
        DB::statement('CREATE INDEX idx_properties_status_verified ON properties(status, is_verified)');
        DB::statement('CREATE INDEX idx_properties_district_city ON properties(district, city)');
        DB::statement('CREATE INDEX idx_properties_price ON properties(price)');
        // GIST spatial index for fast distance queries
        DB::statement('CREATE INDEX idx_properties_location ON properties USING GIST (location)');

        Schema::create('property_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();
            $table->string('image_url');
            $table->boolean('is_primary')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['property_id', 'is_primary']);
            $table->index(['property_id', 'sort_order']);
        });

        Schema::create('inquiries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();
            $table->foreignId('seeker_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('sender_name');
            $table->string('sender_email');
            $table->string('sender_phone')->nullable();
            $table->text('message');
            $table->enum('status', ['unread', 'read', 'replied'])->default('unread');
            $table->timestamps();

            $table->index(['property_id', 'status']);
            $table->index('seeker_id');
        });

        Schema::create('password_resets', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tokenable_id')->nullable();
            $table->string('tokenable_type')->nullable();
            $table->string('name');
            $table->string('token', 64)->primary();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['tokenable_id', 'tokenable_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropAllTables();

        // Drop PostGIS extension
        DB::statement('DROP EXTENSION IF EXISTS postgis');

        Schema::enableForeignKeyConstraints();
    }
};