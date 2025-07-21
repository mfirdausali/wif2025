<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Quotation;
use App\Models\QuotationItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Quotation>
 */
class QuotationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'quotation_date' => $this->faker->dateTimeBetween('-30 days', '+30 days')->format('Y-m-d'),
            'status' => $this->faker->randomElement(Quotation::STATUSES),
            'total_amount' => 0.00, // Will be calculated after items are created
        ];
    }

    /**
     * Configure the factory to create quotation items after creating the quotation.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Quotation $quotation) {
            // Create 2-5 quotation items for each quotation
            $itemCount = $this->faker->numberBetween(2, 5);
            
            QuotationItem::factory()
                ->count($itemCount)
                ->for($quotation)
                ->create();

            // Recalculate the total amount based on created items
            $quotation->calculateTotal();
        });
    }

    /**
     * Indicate that the quotation is in draft status.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Draft',
        ]);
    }

    /**
     * Indicate that the quotation has been sent.
     */
    public function sent(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Sent',
        ]);
    }

    /**
     * Indicate that the quotation has been accepted.
     */
    public function accepted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Accepted',
        ]);
    }

    /**
     * Indicate that the quotation has been declined.
     */
    public function declined(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Declined',
        ]);
    }

    /**
     * Indicate that the quotation has expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Expired',
        ]);
    }
}
