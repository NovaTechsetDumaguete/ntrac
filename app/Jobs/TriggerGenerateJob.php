<?php

namespace App\Jobs;

use App\Events\ReportExported;
use App\Models\Employee;
use App\Models\ExportHistory;
use App\Models\ExtractTrackingData;
use App\Models\TrackRecords;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class TriggerGenerateJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $extract_tracking_data;

    /**
     * Create a new job instance.
     */
    public function __construct(ExtractTrackingData $extractTrackingData)
    {
        $this->extract_tracking_data = $extractTrackingData;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $track_record = TrackRecords::with('employee')
            ->where('datein', $this->extract_tracking_data->date)
            ->where('userid', $this->extract_tracking_data->user_id)
            ->first();

        // $employee = Employee::find($this->extract_tracking_data->userid)

        if (!$track_record)
            return;

        $completed = ExtractTrackingData::where('report_id', $this->extract_tracking_data->report_id)->count();

        $item = [
            'productive' => $this->extract_tracking_data->productive_duration,
            'unproductive' => $this->extract_tracking_data->unproductive_duration,
            'neutral' => $this->extract_tracking_data->neutral_duration,
            'id' => $track_record->employee->employee_id,
            'userid' => $track_record->userid,
            'date' => $track_record->datein,
            'timeout' => $track_record->timeout,
            'timein' => $track_record->timein,
            'employee' => $track_record->employee->first_name . ', ' . $track_record->employee->last_name,
            'export_id' => $this->extract_tracking_data->report_id,
            'items_completed' => $completed,
            'filename' => $this->extract_tracking_data->export_history->filename
        ];

        ReportExported::dispatch($item);
    }
}
