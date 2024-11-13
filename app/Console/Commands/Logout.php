<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\EmployeeController;
use Illuminate\Console\Command;
use App\Models\Employee;
use App\Models\RunningApps;
use App\Models\Team;
use App\Models\TrackRecords;

use Carbon\Carbon;

class Logout extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:logout';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Logout Posting';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            //code...
            // $date = Carbon::parse('2024-05-04');
            $date = Carbon::now()->subDay();
            $sessions = TrackRecords::where('datein', $date->toDateString())
                ->where('timeout', null)
                ->where('dateout', null)
                // ->whereIn('userid', [20, 13, 16, 1])
                ->get();

            $this->info('sessions ' . $sessions->count());

            foreach ($sessions as $session) {
                $last_activity = RunningApps::where('taskid', $session->id)
                    ->where('date', $date->toDateString())
                    ->orderBy('id', 'DESC')
                    ->first();

                if (!$last_activity) continue;

                $session->dateout = $date->toDateString();
                $session->timeout = $last_activity->end_time ?? $last_activity->time;
                $session->save();

                $employee = Employee::find($session->userid);
                if ($last_activity->end_time == null && $employee->active_status == 'Offline') {
                    $last_activity->status = 'Closed';
                    $last_activity->end_time = $last_activity->time;
                    $last_activity->save();
                }
            }

            $generate = new EmployeeController();


            $teams = Team::all();

            foreach ($teams as $team) {
                $members = Employee::where('team_id', $team->id)
                    // ->whereIn('id', [20, 13, 16, 1])
                    ->get();

                request()->merge([
                    'employees' => $members->pluck('id')->toArray(),
                    'type' => 'utils',
                    'teamId' => $team->id,
                    'manager_id' => $team->manager_id,
                ]);

                $test = $generate->getTrackingReport($date->toDateString(), $date->toDateString());
                $this->info(json_encode($test));
            }
        } catch (\Throwable $th) {
            //throw $th;
            $this->info($th->getMessage());
        }
    }
}
