<?php

namespace Database\Factories;

use App\Models\Quotation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\QuotationItem>
 */
class QuotationItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Common tour services for a Japanese tour company
        $services = [
            'Airport Transfer - Narita to Hotel',
            'Full Day Tokyo City Tour',
            'Mount Fuji and Hakone Day Trip',
            'Traditional Ryokan Stay (1 night)',
            'Kyoto Temples and Gardens Tour',
            'Osaka Castle and Dotonbori Walking Tour',
            'Bullet Train Ticket (Tokyo to Kyoto)',
            'Cultural Experience - Tea Ceremony',
            'Hiroshima Peace Memorial Tour',
            'Nara Deer Park and Todai-ji Temple',
            'Professional Tour Guide (Full Day)',
            'Traditional Japanese Dinner',
            'Kimono Rental Experience',
            'Cherry Blossom Viewing Tour',
            'Authentic Sushi Making Class',
        ];

        return [
            'quotation_id' => Quotation::factory(),
            'description' => $this->faker->randomElement($services),
            'quantity' => $this->faker->randomFloat(2, 1, 10), // 1 to 10 with 2 decimal places
            'unit_price' => $this->faker->randomFloat(2, 50, 500), // ¥50 to ¥500 (in hundreds for yen)
        ];
    }

    /**
     * Indicate that the item is for airport transfer service.
     */
    public function airportTransfer(): static
    {
        return $this->state(fn (array $attributes) => [
            'description' => 'Airport Transfer - Narita to Hotel',
            'quantity' => 1,
            'unit_price' => $this->faker->randomFloat(2, 80, 120),
        ]);
    }

    /**
     * Indicate that the item is for a full day tour.
     */
    public function fullDayTour(): static
    {
        return $this->state(fn (array $attributes) => [
            'description' => 'Full Day ' . $this->faker->randomElement(['Tokyo', 'Kyoto', 'Osaka']) . ' Tour',
            'quantity' => 1,
            'unit_price' => $this->faker->randomFloat(2, 200, 350),
        ]);
    }

    /**
     * Indicate that the item is for accommodation.
     */
    public function accommodation(): static
    {
        return $this->state(fn (array $attributes) => [
            'description' => 'Hotel Accommodation (' . $this->faker->numberBetween(1, 3) . ' nights)',
            'quantity' => $this->faker->numberBetween(1, 4), // Number of rooms
            'unit_price' => $this->faker->randomFloat(2, 150, 400), // Per night per room
        ]);
    }

    /**
     * Indicate that the item is for transportation.
     */
    public function transportation(): static
    {
        return $this->state(fn (array $attributes) => [
            'description' => $this->faker->randomElement([
                'Bullet Train Ticket (Tokyo to Kyoto)',
                'JR Pass (7 Days)',
                'Private Vehicle with Driver (Half Day)',
                'Public Transport Day Pass'
            ]),
            'quantity' => $this->faker->numberBetween(1, 6), // Number of passengers
            'unit_price' => $this->faker->randomFloat(2, 30, 250),
        ]);
    }
}
