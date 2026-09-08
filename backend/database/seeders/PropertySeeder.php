<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\User;
use Illuminate\Database\Seeders\DatabaseSeeder as BaseSeeder;
use Illuminate\Support\Facades\DB;

class PropertySeeder extends BaseSeeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $agent = User::where('email', 'agent@amdernproperties.com')->first();
        $developer = User::where('email', 'developer@amdernproperties.com')->first();

        $kampalaProperties = [
            [
                'title' => 'Executive Apartment in Kololo',
                'slug' => 'executive-apartment-kololo',
                'description' => 'Luxurious 3-bedroom apartment with panoramic views of Kampala city.',
                'price' => 450000000,
                'currency' => 'UGX',
                'listing_type' => 'for_sale',
                'property_type' => 'apartment',
                'bedrooms' => 3,
                'bathrooms' => 2,
                'is_verified' => true,
                'status' => 'active',
                'address' => 'Plot 1234 Kololo Hill',
                'city' => 'Kampala',
                'district' => 'Kampala',
                'amenities' => ['swimming_pool', 'gym', 'security', 'parking'],
                'location' => [32.5835, 0.3136],
            ],
            [
                'title' => 'Modern House in Bugolobi',
                'slug' => 'modern-house-bugolobi',
                'description' => 'Spacious 4-bedroom house with a beautiful garden in Bugolobi.',
                'price' => 650000000,
                'currency' => 'UGX',
                'listing_type' => 'for_sale',
                'property_type' => 'house',
                'bedrooms' => 4,
                'bathrooms' => 3,
                'is_verified' => true,
                'status' => 'active',
                'address' => 'Plot 5678 Bugolobi Road',
                'city' => 'Kampala',
                'district' => 'Kampala',
                'amenities' => ['garden', 'parking', 'security', 'water_tank'],
                'location' => [32.6012, 0.3547],
            ],
            [
                'title' => 'Commercial Land in Nakawa',
                'slug' => 'commercial-land-nakawa',
                'description' => 'Prime commercial land suitable for office complex or shopping mall.',
                'price' => 850000000,
                'currency' => 'UGX',
                'listing_type' => 'for_sale',
                'property_type' => 'commercial',
                'bedrooms' => 0,
                'bathrooms' => 0,
                'is_verified' => true,
                'status' => 'active',
                'address' => 'Plot 9012 Nakawa Industrial Area',
                'city' => 'Kampala',
                'district' => 'Kampala',
                'amenities' => ['electricity', 'water', 'parking'],
                'location' => [32.6321, 0.3890],
            ],
            [
                'title' => 'Luxury 2-Bedroom Apartment for Rent in Bukasa',
                'slug' => 'luxury-apartment-bukasa',
                'description' => 'Fully furnished 2-bedroom apartment with sea views in Bukasa.',
                'price' => 1500000,
                'currency' => 'UGX',
                'listing_type' => 'for_rent',
                'property_type' => 'apartment',
                'bedrooms' => 2,
                'bathrooms' => 1,
                'is_verified' => true,
                'status' => 'active',
                'address' => 'Plot 3456 Bukasa Road',
                'city' => 'Kampala',
                'district' => 'Kampala',
                'amenities' => ['furnished', 'wifi', 'security', 'parking'],
                'location' => [32.6156, 0.3421],
            ],
            [
                'title' => 'Residential Plot in Kyaliwajjala',
                'slug' => 'residential-plot-kyaliwajjala',
                'description' => '50ft by 100ft residential plot in a well-developed area.',
                'price' => 250000000,
                'currency' => 'UGX',
                'listing_type' => 'for_sale',
                'property_type' => 'land',
                'bedrooms' => 0,
                'bathrooms' => 0,
                'is_verified' => true,
                'status' => 'active',
                'address' => 'Plot 7890 Kyaliwajjala',
                'city' => 'Wakiso',
                'district' => 'Wakiso',
                'amenities' => ['electricity', 'water', 'road_access'],
                'location' => [32.5123, 0.2834],
            ],
        ];

        foreach ($kampalaProperties as $propData) {
            $property = Property::create(array_merge($propData, [
                'user_id' => $agent->id,
            ]));

            // Add images
            PropertyImage::create([
                'property_id' => $property->id,
                'image_url' => "/property-media/property-{$property->id}-1.jpg",
                'is_primary' => true,
                'sort_order' => 0,
            ]);

            PropertyImage::create([
                'property_id' => $property->id,
                'image_url' => "/property-media/property-{$property->id}-2.jpg",
                'is_primary' => false,
                'sort_order' => 1,
            ]);
        }
    }
}