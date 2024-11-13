<?php

namespace App\Console\Commands;

use App\Events\ReportExported;
use App\Jobs\GenerateReportJob;
use App\Models\ExportHistory;
use App\Models\AppCategories;
use App\Models\ExtractTrackingData;
use App\Models\RunningApps;
use App\Models\TrackRecords;

use Illuminate\Console\Command;

class ExportReport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:export-report';

    private $track_record;

    private $export_history;

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
        $this->export_history = ExportHistory::find(102);
        $this->track_record = TrackRecords::with('employee')->where('id', 4398)->first();
        // GenerateReportJob::dispatch($report);

        $cat_prod = AppCategories::select('id')->where('is_productive', 1)->get();
        $cat_unprod = AppCategories::select('id')->where('is_productive', 0)->get();
        $cat_neu = AppCategories::select('id')->where('is_productive', 2)->get();

        $apps = RunningApps::where('taskid', $this->track_record->id)->get();
        $productive = $unproductive = $neutral = 0;

        foreach ($apps as $app) {
            # code...
            if (in_array($app->category_id, $cat_prod->pluck('id')->toArray())) {
                $productive += $app->duration;
            }

            if (in_array($app->category_id, $cat_unprod->pluck('id')->toArray())) {
                $unproductive += $app->duration;
            }

            if (in_array($app->category_id, $cat_neu->pluck('id')->toArray())) {
                $neutral += $app->duration;
            }
        }

        $item = [
            'productive' => $productive,
            'unproductive' => $unproductive,
            'neutral' => $neutral,
            'id' => $this->track_record->employee->employee_id,
            'userid' => $this->track_record->userid,
            'date' => $this->track_record->datein,
            'timeout' => $this->track_record->timeout,
            'timein' => $this->track_record->timein,
            'employee' => $this->track_record->employee->first_name . ', ' . $this->track_record->employee->last_name,
            'export_id' => $this->export_history->id
        ];

        ExtractTrackingData::create([
            'user_id' => $this->export_history->userid,
            'report_id' => $this->export_history->id,
            'employee_id' => $this->track_record->userid,
            'productive_duration' => $productive,
            'unproductive_duration' => $unproductive,
            'neutral_duration' => $neutral,
            'date' => $this->track_record->datein,
            'time_in' => $this->track_record->timein,
            'time_out' => $this->track_record->timeout,
        ]);

        // ReportExported::dispatchSync($item);
        ReportExported::dispatch($item);
        // event(new ReportExported($item));

        $this->info('done: ' . json_encode($this->track_record));
    }
}
