<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RunningApps;
use App\Models\Employee;
use App\Models\Bug;
use App\Models\Anomaly;
use App\Models\ExportHistory;
use App\Models\ExtractTrackingData;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;


class ReportController extends Controller
{
    public function getBugReports()
    {
        $reports = Bug::limit(10)
            ->orderBy('id', 'desc')
            ->get();


        return response()->json(['data' => $reports], 200);
    }

    public function insertBugReports(Request $request)
    {
        $request->validate([
            'description' => 'required',
            'date_report' => 'required',
            'time_report' => 'required',
            'userid' => 'required',
        ]);

        $bug = Bug::create([
            'description' => $request->description,
            'date_report' => $request->date_report,
            'time_report' => $request->time_report,
            'userid' => $request->userid,
            'status' => $request->status ?? 'Pending',
        ]);

        return response()->json([
            'data' => $bug,
            'message' => 'Success',
        ], 201);
    }

    public function getAnomalyReport(Request $request)
    {
        $request->validate([
            'userid' => 'required|exists:accounts,id',
            'start' => 'date|required',
        ]);

        $userid = $request->userid;
        $start = $request->start;
        $end = $request->end ?? $request->start;

        $redis = Redis::get('anomaly:' . $userid . ':' . $start . '-' . $end);
        if ($redis) {
            $anomalies = json_decode($redis, true);
            return response()->json([
                'data' => $anomalies,
                'message' => 'Success',
                'redis' => true,
            ], 200);
        }

        $anomalies = Anomaly::where('userid', $userid)
            ->whereBetween('date', [$start, $end])
            ->get();

        # if (Carbon::parse($start)->isToday())
        #     $expiry = 60 * 60 * 24 * 30;
        # else
        $expiry = 60 * 60;

        Redis::set('anomaly:' . $userid . ':' . $start . '-' . $end, json_encode($anomalies), 'EX', $expiry);
        return response()->json([
            'data' => $anomalies,
            'message' => 'Success',
            'redis' => false,
        ], 200);
    }

    public function getReportHistoryByManager(Request $request)
    {
        $request->validate([
            'userId' => 'exists:users,id',
            'teamId' => 'exists:teams,id'
        ]);

        $history = ExportHistory::where('userid', $request->userId)
            ->orderBy('id', 'DESC')
            ->get();

        return response()->json([
            'data' => $history
        ]);
    }

    public function updateReportHistory(Request $request)
    {
        $request->validate([
            'id' => 'exists:export_history,id|required',
            'status' => 'in:failed,completed,pending,started|required'
        ]);

        $update = ExportHistory::find($request->id)->update([
            'status' => $request->status
        ]);

        return response()->json([
            'data' => $update,
            'message' => 'Status updated.'
        ], 200);
    }

    public function downloadReports(Request $request)
    {
        try {
            if ($request->moduleType == 'tracking') {
                $data = ExtractTrackingData::with('employee')
                    ->where('report_id', $request->reportId)->get();
            }
        } catch (\Throwable $th) {
            throw $th->getMessage();
        }


        return response()->json([
            'data' => $data ?? [],
            'message' => 'Success'
        ], 200);
    }
}
