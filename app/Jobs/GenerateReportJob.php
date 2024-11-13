<?php

namespace App\Jobs;

use App\Models\AppCategories;
use App\Models\ExportHistory;
use App\Models\ExtractTrackingData;
use App\Models\RunningApps;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Carbon\Carbon;


use App\Models\TrackRecords;

class GenerateReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $export_history;
    public $track_record;
    public $extract_tracking_data;

    /**
     * Create a new job instance.
     */
    public function __construct(
        ExportHistory $exportHistory,
        TrackRecords $trackRecord,
        ExtractTrackingData $extractTrackingData
    ) {
        $this->export_history = $exportHistory;
        $this->track_record = $trackRecord;
        $this->extract_tracking_data = $extractTrackingData;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
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

            $this->extract_tracking_data->update([
                'productive_duration' => $productive,
                'unproductive_duration' => $unproductive,
                'neutral_duration' => $neutral,
            ]);

            $completed = ExtractTrackingData::where('report_id', $this->export_history->id)->count();

            if ($completed == $this->export_history->item_count) {
                $this->export_history->update([
                    'status' => 'completed',
                    'filename' => 'nTrac-Tracking-Reports-' . Carbon::now()->unix() . '.xlsx',
                ]);
            }
        } catch (\Throwable $th) {
            // \Log::info($th->getMessage());
            $this->export_history->update([
                'status' => 'failed'
            ]);
        }
    }
}
