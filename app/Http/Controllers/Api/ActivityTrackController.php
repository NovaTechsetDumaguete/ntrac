<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppCategories;
use App\Models\RunningApps;
use App\Models\Employee;
use App\Models\TrackRecords;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Redis;

class ActivityTrackController extends Controller
{
    private $seconds_ten_min_ttl = 600; // 10min

    private $seconds_month_ttl = 86400; // 1d

    public function getEmployeesByTeam($team_id)
    {
        return response()->json([
            'data' => [],
            'message' => 'Employees not found',
        ], 200);
    }

    public function getEmployeeActivity($userid, $date = null)
    {
        try {
            Validator::make([
                'userid' => $userid,
                'date' => $date,
            ], [
                'userid' => 'required|integer|exists:accounts,id',
                'date' => 'nullable|date',
            ]);

            $date = Carbon::parse($date) ?? Carbon::now();
            $is_past = Carbon::now()->startOfDay()->gt($date);

            $redis_data = Redis::get('emp_logs:' . $userid . ':' . $date->toDateString());

            if ($redis_data != "[]" && $redis_data != null)
                return response()->json([
                    'data' => json_decode($redis_data),
                    'message' => 'Success',
                    'redis' => true,
                ], 200);

            $track = TrackRecords::where('userid', $userid)
                ->where('datein', $date->toDateString())
                ->first();

            if (!$track)
                return response()->json([
                    'data' => [],
                    'message' => 'No data found',
                    'redis' => false,
                ], 200);

            $apps = RunningApps::with('employee', 'category')
                ->where('taskid', $track->id)
                ->whereNot('end_time', NULL)
                ->where('time', '>=', Carbon::parse($track->timein)->toTimeString())
                ->orderBy('time', 'asc')
                ->get();

            $ttl = $is_past ? $this->seconds_month_ttl : $this->seconds_ten_min_ttl;
            // Redis::set('emp_logs:' . $userid . ':' . $date->toDateString(), json_encode($apps), 'EX', $ttl);
            // $apps = $apps->aSort('time')->all();
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Internal Server Error!',
            ], 500);
        }

        return response()->json([
            'data' => $apps ?? [],
            'message' => count($apps) > 0 ? 'Success' : 'Employee not found',
            'redis' => false,
        ], 200);
    }

    public function getActiveStatus($userid)
    {
        try {
            $employee = Employee::findOrFail($userid);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Internal Server Error!',
            ], 500);
        }

        return response()->json([
            'data' => $employee->active_status,
            'message' => 'Success',
        ], 200);
    }

    public function updateActiveStatus(Request $request)
    {
        if ($request->userid == 131) {
            $request->userid = 20;
        }

        $request->validate([
            'userid' => 'required|exists:accounts,id',
            'status' => 'in:Active,Offline,Away,Waiting',
            'incremented' => 'integer',
        ]);

        $employee = Employee::findOrFail($request->userid);
        // $incremented = $request->status == 'Offline'
        //     ? 0
        //     : $request->incremented ?? $employee->incremented;

        $employee->active_status = $request->status;
        if ($request->status == 'Offline') {
            $employee->incremented = 0;
        }
        // $employee->incremented = $incremented;
        $employee->save();

        return response()->json([
            'data' => $employee,
            'message' => 'Success',
        ], 200);
    }

    /**
     * New Team Productivity Data
     */
    public function getTeamProductivityData($team_id, $date = null)
    {
        try {
            Validator::make([
                'team_id' => $team_id,
                'date' => $date,
            ], [
                'team_id' => 'required|integer|exists:teams,id',
                'date' => 'nullable|date',
            ]);

            $date = Carbon::parse($date) ?? Carbon::now();
            $employees = Employee::where('team_id', $team_id)->get();
            $tracks = TrackRecords::whereIn('userid', $employees->pluck('id'))
                ->where('datein', $date->toDateString())
                ->get();

            $data = [];
            foreach ($tracks as $track) {
                $apps = RunningApps::with('category')
                    ->where('taskid', $track->id)
                    ->where('userid', $track->userid)
                    ->get();

                $duration = $apps->groupBy('category.is_productive')->map(function ($item) {
                    return [
                        'type' => $item->first()->category->is_productive,
                        'duration' => $item->sum('duration'),
                    ];
                });

                $data[] = [
                    'userid' => $track->userid,
                    'unproductive' => collect($duration)->where('type', "0")->first()['duration'] ?? 0,
                    'productive' => collect($duration)->where('type', "1")->first()['duration'] ?? 0,
                    'neutral' => collect($duration)->where('type', "2")->first()['duration'] ?? 0,
                    'first_name' => $apps->first()->employee->first_name,
                ];
            }
        } catch (\Throwable $th) {
            throw $th;
        }

        return response()->json([
            'data' => $data,
            'message' => 'Success',
        ], 200);
    }

    public function getNeutralProductiveDuration(Request $request)
    {
        try {
            $request->validate([
                'date' => 'required|date',
                'userid' => 'required|integer|exists:accounts,id',
            ]);

            $date = Carbon::parse($request->date);
            $employee = Employee::find($request->userid);
            $track = TrackRecords::where('userid', $employee->id)
                ->where('datein', $date->toDateString())
                ->first();

            if (!$track) {
                return response()->json([
                    'data' => 0,
                    'message' => 'No data found',
                ], 200);
            }

            $categories = AppCategories::select('id')->whereIn('is_productive', [1, 2])->get();

            $duration = RunningApps::where('taskid', $track->id)
                ->whereIn('category_id', $categories->pluck('id'))
                ->sum('duration');
        } catch (\Throwable $th) {
            return response()->json([
                'error' => $th->getMessage(),
                'message' => 'Internal Server Error!',
            ], 500);
        }

        return response()->json([
            'data' => $duration,
            'message' => 'Success',
        ], 200);
    }

    public function getActivityByEmployee(Request $request)
    {
        $request->validate([
            'employee_id' => 'exists:accounts,id|required'
        ]);

        $date = !request()->has('date') ? Carbon::now() : Carbon::parse($request->date);
        $tracking = TrackRecords::where('userid', $request->employee_id)
            ->where('datein', $date->toDateTimeLocalString())
            ->first();

        if (!$tracking) {
            // throw new \Exception("No records found", 1);
            return [];
        }

        $data = [];
        $categories = [];
        $apps = RunningApps::where('taskid', $tracking->id)->get();

        foreach ($apps as $app) {
            $key = array_search($app->category->name, $categories);
            if (!in_array($app->category->name, $categories)) {
                $data[] = [
                    'name' => $app->category->name,
                    'category_id' => $app->category_id,
                    'duration' => $app->duration,
                    'type' => $app->category->is_productive,
                    'icon' => $app->category->icon
                ];
                array_push($categories, $app->category->name);
            } else {
                $data[$key]['duration'] += $app->duration;
            }
        }

        return response()->json([
            'data' => $data,
            'message' => 'Success'
        ], 200);
    }
}
