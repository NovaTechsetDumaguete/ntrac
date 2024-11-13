<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Employee;

use Illuminate\Support\Facades\Redis;
use Carbon\Carbon;

class ActiveStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:active-status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    private function getActiveStatus($increment)
    {
        if ($increment <= 240) {
            return 'Active';
        }

        // waiting = inactive for 4 minutes            
        if ($increment <= 480) {
            return 'Waiting';
        }

        // away = inactive for 10 minutes
        if ($increment <= 600) {
            return 'Away';
        }

        return 'Offline';
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting active status check...');
        // \Log::info('Active status check started...');
        $ref = Employee::select('id', 'active_status')
            ->whereNot('active_status', 'Offline')
            // ->where('incremented', '>', 60)
            ->get();

        $current = [];
        foreach ($ref as $key) {
            array_push($current, $key->id);
        }

        // \Log::info("Current: " . json_encode($current));

        sleep(10);
        foreach ($ref as $key) {
            $redis_incr = Redis::get('incremented:' . $key->id);

            $increment = Carbon::now()->timestamp - $redis_incr;
            $active_status = $this->getActiveStatus($increment);

            $emp = Employee::find($key->id);
            $emp->active_status = $active_status;
            $emp->incremented = $increment;

            if ($active_status == 'Offline') {
                $emp->incremented = 0;
                Redis::del('offline:' . $key->id);
            }

            // if ($key->active_status != $active_status) {
            //     \Log::info("Employee: " . $emp->employee_id . " - " . $active_status . " - " . $key->active_status);
            // }

            $emp->save();
        }
    }
}
