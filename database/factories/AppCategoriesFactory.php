<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\AppCategories;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AppCategories>
 */
class AppCategoriesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Get an existing user ID from your User model
        $userId = User::inRandomOrder()->value('id');

        return [
            'name' => $this->faker->word,
            'description' => $this->faker->sentence,
            'is_productive' => $this->faker->numberBetween(0, 1),
        ];
    }
}
