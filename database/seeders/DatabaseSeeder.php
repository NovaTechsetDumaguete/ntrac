<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        \App\Models\User::factory()->create([
            'name' => 'Test Admin',
            'email' => 'admin@novatechset.com',
        ]);

        \App\Models\User::factory(30)->create();

        \App\Models\AppCategories::factory()->create([
            'name' => 'Productive',
            'description' => 'Productive applications',
            'is_productive' => 1
        ]);
        \App\Models\AppCategories::factory()->create([
            'name' => 'Unproductive',
            'description' => 'None Productive applications',
            'is_productive' => 0
        ]);
        \App\Models\AppCategories::factory()->create([
            'name' => 'Neutral',
            'description' => 'Neutral applications',
            'is_productive' => 1
        ]);

        \App\Models\RunningApps::factory(30)->create();

        $this->call([
            EmployeeSeeder::class
        ]);
    }
}
