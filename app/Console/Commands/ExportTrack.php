<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\Api\EmployeeController;

use App\Models\TrackRecords;
use Carbon\Carbon;


class ExportTrack extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:export-track';

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

        $export = new EmployeeController();
        $date = Carbon::now()->subDay();

        $employees = TrackRecords::orderBy('id', 'desc')->where('datein', $date->toDateString())->get();

        request()->merge([
            'employees' => $employees->pluck('userid')->toArray(),
        ]);

        $export->getTrackingReport($date->toDateString(), $date->toDateString());
    }
}
