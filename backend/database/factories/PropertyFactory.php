<?php

namespace Database\Factories;

use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Factories\Factory;
use Illuminate\Support\Str;

class PropertyFactory extends Factory
{
    protected $model = Property::class;

    public function definition(): array
    {
        $listingTypes = ['for_sale', 'for_rent'];
        $propertyTypes = ['apartment', 'house', 'land', 'commercial'];
        $cities = ['Kampala', 'Wakiso', 'Entebbe', 'Mukono'];
        $districts = ['Kampala', 'Wakiso', 'Entebbe', 'Mukono', 'Luwero'];

        $title = $this->faker->catchWords(3, true);

        return [
            'user_id' => User::inRandomOrder()->first()?->id ?? User::factory(),
            'title' => $title,
            'slug' => Str::slug($title) . '-' . $this->faker->unique()->numberBetween(1000, 9999),
            'description' => $this->faker->paragraph(5),
            'price' => $this->faker->numberBetween(50000000, 2000000000),
            'currency' => 'UGX',
            'listing_type' => $this->faker->randomElement($listingTypes),
            'property_type' => $this->faker->randomElement($propertyTypes),
            'bedrooms' => $this->faker->numberBetween(0, 6),
            'bathrooms' => $this->faker->numberBetween(0, 5),
            'is_verified' => $this->faker->boolean(70),
            'status' => $this->faker->randomElement(['active', 'pending', 'sold']),
            'address' => $this->faker->streetAddress,
            'city' => $this->faker->randomElement($cities),
            'district' => $this->faker->randomElement($districts),
            'amenities' => $this->faker->randomElements(
                ['parking', 'security', 'garden', 'gym', 'swimming_pool', 'wifi', 'furnished', 'water_tank'],
                $this->faker->numberBetween(2, 5)
            ),
            'location' => [
                $this->faker->longitude(32.4, 32.7),
                $this->faker->latitude(0.2, 0.5),
            ],
            'created_at' => $this->faker->dateTimeBetween('-6 months'),
        ];
    }
}