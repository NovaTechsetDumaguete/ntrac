<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\RunningApps;
use App\Models\TrackRecords;
use App\Models\Employee;
use App\Models\TempTaskrunning;
use Carbon\Carbon;

class TimeLog extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'budol:time-log';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Magic your logs';



    private function convertTimeToSecond(string $time): int
    {
        $d = explode(':', $time);
        return ($d[0] * 3600) + ($d[1] * 60) + $d[2];
    }


    /**
     * Execute the console command.
     */
    public function handle()
    {
        $ref_date = '2024-05-14';
        // $members = Employee::select('id')->whereIn('team_id', [10])->get();
        // $tracks = TrackRecords::whereDate('datein', '=', $ref_date)
        //     ->whereIn('userid', $members->pluck('id'))
        //     ->get();

        $budols = RunningApps::where('taskid', 4037)
            ->whereBetween('time', [Carbon::parse('10:25'), Carbon::parse('12:49')])
            ->get();

        $this->info('Logs: ' . $budols->count());
        foreach ($budols as $budol) {
            // $employee = Employee::find($log->userid);
            // $this->info($log->time);
            $inserted = TempTaskrunning::create([
                'userid' => 20,
                'taskid' => 4592,
                'description' => $budol->description,
                'date' => $ref_date,
                'time' => Carbon::parse($budol->time)->toTimeString(),
                'status' => 'Closed',
                'category_id' => $budol->category_id,
                'end_time' => Carbon::parse($budol->end_time)->toTimeString(),
                'platform' => 'desktop',
                'type' => 'actual',
            ]);

            if ($inserted) {
                $this->info('data: ' . json_encode($inserted));
            }
        }
    }
}
