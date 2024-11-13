<?php

namespace App\Console\Commands;

use App\Models\AppCategories;
use App\Models\RunningApps;
use App\Models\TrackRecords;

use Carbon\Carbon;
use Illuminate\Console\Command;

class FixCategory extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fix-category';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // $trax = TrackRecords::where('datein', Carbon::now()->toDateString())->get();

        // foreach ($trax as $key) {
        //     $tasks =  RunningApps::where('taskid', $key->id)
        //         ->where('category_id', 90)
        //         ->get();
        //     foreach ($tasks as $task) {
        //         if ($task->description != 'Desktop') {
        //             $task->category_id = 91;
        //             $task->save();

        //             $this->info($task->description);
        //         }
        //     }
        // }
        $categories = AppCategories::where('update_status', null)
            ->orderBy('priority_id', 'ASC')
            ->orderBy('id', 'ASC')
            ->limit(10)
            ->get();

        // $categories = [146, 134, 137];

        // foreach ($categories as $key) {
        //     RunningApps::where('category_id', $key)
        //         ->update(['category_id' => 6]);
        //     $deleted = AppCategories::find($key)->delete();
        //     $this->info($deleted);
        // }


        // $categories = AppCategories::where('id', 85)->get();

        foreach ($categories as $category) {
            $updated = RunningApps::whereIn('category_id', [6])
                ->whereDate('created_at', '>=', Carbon::now()->startOfMonth())
                ->where('description', 'LIKE', "%{$category->name}%")
                ->update([
                    'category_id' => $category->id,
                ]);

            \Log::info("Updated: " . $updated);

            $category->update_status = 'done';
            $category->save();
        }

        // $term = 'nTrac Admin';
        // RunningApps::where('category_id', 25)
        //     ->where('description', 'LIKE', "%{$term}%")
        //     //
        //     ->update([
        //         'category_id' => 28,
        //     ]);
    }
}
