<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\AppCategories;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RunningApps>
 */
class RunningAppsFactory extends Factory
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
        $categoryId = AppCategories::inRandomOrder()->value('id');

        return [
            'task_name' => $this->faker->word,
            'category_id' => $categoryId,
            'taskid' => $this->faker->numberBetween(1, 99),
            'userid' => $userId,
            'date' => $this->faker->date('Y-m-d'),
            'time' => $this->faker->time('H:i:s'),
        ];
    }
}
