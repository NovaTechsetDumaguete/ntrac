<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Employee;
use App\Models\Position;

class FixEmployeeTeam extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fix-employee-team';

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
        $employees = Employee::all();
        foreach ($employees as $employee) {
            // $employee->team_id = $employee->position->team_id;
            // $employee->save();
            $position = Position::find($employee->position_id);
            // $this->info($employee->id . ":" . $position->team_id);
            $employee->team_id = $position->team_id;
            $employee->save();
        }
    }
}
