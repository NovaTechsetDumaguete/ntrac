<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RunningAppsResource;

use App\Models\RunningApps;
use App\Models\Settings;
use App\Models\TrackRecords;
use App\Models\AppCategories;
use App\Models\Employee;
use App\Models\TempTaskrunning;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // Import the DB facade

use Illuminate\Support\Facades\Log; // Import the Log facade
use Illuminate\Support\Facades\Redis;

class RunningAppsController extends Controller
{
    private $seconds_ten_min_ttl = 300; // 5min

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return RunningAppsResource::collection(RunningApps::query()->orderBy('id', 'desc')->paginate(10));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function recordLogTest(Request $request)
    {
        $task = TrackRecords::where('userid', $request->userid)
            ->where('datein', $request->date)
            ->first();

        $timein = Carbon::parse($task->timein);
        $insert = Carbon::parse($request->time);

        return response()->json([
            'track_in' => $task->timein,
            'timein' => $timein,
            'insert_in' => $insert,
            'is_past' => $timein->gt($insert),
        ]);
    }

    public function deleteUserData(Request $request)
    {
        TrackRecords::where('userid', $request->userid)->delete();

        // Delete records from RunningApps where 'userid' matches
        RunningApps::where('userid', $request->userid)->delete();

        // Delete record from Employee where 'id' matches
        Employee::where('id', $request->userid)->delete();

        return response()->json([
            'message' => 'Deleted'
        ]);
    }


    public function getAllDubplicates(Request $request)
    {
        // Validate the request to ensure 'date' is provided
        $request->validate([
            'date' => 'required|date',
        ]);

        DB::beginTransaction();
        try {
            // Find the groups that have duplicates based on the provided date and time
            $duplicateGroups = RunningApps::select('date', 'time', DB::raw('COUNT(*) as count'))
                ->where('date', $request->date) // Filter by the provided date
                ->groupBy('date', 'time')
                ->having('count', '>', 1)
                ->get();

            // Log the duplicate groups for debugging
            Log::info('Duplicate Groups:', ['groups' => $duplicateGroups]);

            if ($duplicateGroups->isEmpty()) {
                return response()->json([
                    'message' => 'No duplicates found for the given date.',
                    'status' => true,
                ], 200);
            }

            // Extract the times that have duplicates for the given date
            $duplicateTimes = $duplicateGroups->pluck('time')->all();

            $duplicates = collect();

            // Fetch and process all records that match the duplicate conditions for the given date
            foreach ($duplicateTimes as $time) {
                $records = RunningApps::where('date', $request->date)
                    ->where('time', $time)
                    ->orderBy('id', 'ASC')
                    ->get();

                // Log the records for debugging
                Log::info('Duplicate Records:', ['time' => $time, 'records' => $records]);

                // Keep the first record and collect the rest for deletion
                if ($records->count() > 1) {
                    $duplicates = $duplicates->merge($records->slice(1)); // Collect records except the first one
                }
            }

            // Log the duplicates for debugging
            Log::info('Duplicates to Delete:', ['duplicates' => $duplicates]);

            if ($duplicates->isEmpty()) {
                return response()->json([
                    'message' => 'No duplicates found to delete.',
                    'status' => true,
                ], 200);
            }

            // Delete the duplicates, keeping one record in each group
            RunningApps::destroy($duplicates->pluck('id'));

            DB::commit();

            return response()->json([
                'message' => 'Duplicates removed successfully for date ' . $request->date,
                'status' => true,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error removing duplicates:', ['error' => $e->getMessage()]);
            return response()->json(['message' => $e->getMessage(), 'status' => false], 500);
        }
    }


    public function recordVDILog(Request $request)
    {
        try {
            $request->validate([
                'userid' => 'required|exists:accounts,id',
                'date' => 'required|date',
                'time' => 'required',
                'description' => 'required|not_in:Away',
            ]);

            if ($request->userid == 131)
                $request->userid = 20;

            $task = TrackRecords::where('userid', $request->userid)
                ->where('datein', $request->date)
                ->first();

            if (!$task) {
                $task = TrackRecords::create([
                    'userid' => $request->userid,
                    'datein' => $request->date,
                    'timein' => $request->time,
                ]);
            }

            $timein = Carbon::parse($task->timein);
            $req_time = Carbon::parse($request->time);
            $prev_desc = Redis::get('prev:description:' . $request->userid);
            $prev_id = Redis::get('prev:id:' . $request->userid);

            if ($timein->gt($req_time)) {
                $task->timein = $request->time;
                $task->save();
            }

            if ($prev_desc == $request->description) {
                // \Log::info('duplicated desc found: ' .  $request->description . ', prev_id: ' . $prev_id);
                $prev = RunningApps::find($prev_id);
                $prev->end_time = $request->end_time;
                $prev->save();

                return response()->json([
                    'message' => 'end_time updated.',
                    'status' => true,
                ], 204);
            }

            $categories = AppCategories::orderBy('priority_id', 'ASC')
                ->orderBy('id', 'ASC')
                ->get();

            $category_id = 6;
            foreach ($categories as $category) {
                if (str_contains(strtolower($request->description), strtolower($category->name))) {
                    $category_id = $category->id;
                    break;
                }
            }

            $prev_end_time = Redis::get('prev:end_time:' . $request->userid);
            // $start_time = $request->time;
            // if (Carbon::parse($prev_end_time)->gt(Carbon::parse($start_time))) {
            //     $start_time = Carbon::parse($start_time)->addSecond()->toTimeString();
            // }

            $data = RunningApps::create([
                'userid' => $request->userid,
                'taskid' => $task->id,
                'description' => $request->description,
                'date' => $request->date,
                'time' => $request->time,
                'status' => $request->status,
                'category_id' => $category_id,
                'end_time' => $request->end_time ?? null,
                'platform' => 'vdi',
            ]);

            Redis::set('prev:end_time:' . $request->userid, $request->end_time, 'EX', 1200);
            Redis::set('prev:description:' . $request->userid, $request->description, 'EX', 1200);
            Redis::set('prev:id:' . $request->userid, $data->id, 'EX', 1200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage(), 'status' => false], 500);
        }

        return response()->json([
            'message' => 'Log recorded',
            'status' => true,
            'data' => $data,
        ], 201);
    }
    public function checkRecord(Request $request)
    {
        //$start_time = Carbon::parse($request->time)->addSecond()->toTimeString();
        $start_time = $request->time;


        $task1 = TempTaskrunning::where('userid', $request->userid)
            ->where('date', $request->date)
            ->where('time', $start_time)
            ->first();

        if ($task1) {
            return response()->json([
                'message' => 'Record Already Existing.',
                'status' => true,
                'data' => [
                    'id' => null,
                ],
            ], 201);
        } else {

            $task2 = RunningApps::where('userid', $request->userid)
                ->where('date', $request->date)
                ->where('time', $start_time)
                ->first();

            if ($task2) {
                return response()->json([
                    'message' => 'Record Already Existing.',
                    'status' => true,
                    'data' => [
                        'id' => null,
                    ],
                ], 201);
            } else {
                return response()->json([
                    'message' => 'Record Not Exist.',
                    'status' => false,
                    'data' => [
                        'id' => null,
                    ],
                ], 201);
            }
        }
    }
    public function recordLog(Request $request)
    {
        try {
            $request->validate([
                'userid' => 'required|exists:accounts,id',
                'date' => 'required|date',
                'time' => 'required',
                'description' => 'required|not_in:Away,Windows Default Lock Screen',
            ]);

            Redis::set('incremented:' . $request->userid, Carbon::now()->timestamp);
            $emp = Employee::find($request->userid);
            $emp->active_status = 'Active';
            $emp->save();

            if (Carbon::parse($request->time)->gt(Carbon::parse($request->end_time))) {
                throw new \Exception('End time must be greater than start time.');
            }


            $task = TrackRecords::where('userid', $request->userid)
                ->where('datein', $request->date)
                ->first();

            if (!$task) {
                $task = TrackRecords::create([
                    'userid' => $request->userid,
                    'datein' => $request->date,
                    'timein' => $request->time,
                ]);
            }

            $timein = Carbon::parse($task->timein);
            $req_time = Carbon::parse($request->time);
            $prev_desc = Redis::get('prev:description:' . $request->userid);
            $prev_start_time = Redis::get('prev:start_time:' . $request->userid);

            if ($timein->gt($req_time)) {
                $task->timein = $request->time;
                $task->save();
            }

            if ($prev_desc == $request->description && $request->type == 'actual' && $prev_start_time == $request->time) {
                $prev = RunningApps::select('end_time')
                    ->where('userid', $request->userid)
                    ->where('description', $prev_desc)
                    ->orderBy('id', 'DESC')
                    ->first();

                if ($prev) {
                    $prev->end_time = $request->end_time;
                    $prev->save();
                }

                return response()->json([
                    'message' => 'end_time updated.',
                    'status' => true,
                ], 204);
            }

            $categories = json_decode(Redis::get('categories'));
            if (!$categories) {
                $categories = AppCategories::orderBy('priority_id', 'ASC')
                    ->orderBy('id', 'ASC')
                    ->get();
                Redis::set('categories', $categories, 'EX', 21600);
            }


            $category_id = 6;
            foreach ($categories as $category) {
                if (str_contains(strtolower($request->description), strtolower($category->name))) {
                    $category_id = $category->id;
                    break;
                }
            }

            $prev_end_time = Redis::get('prev:end_time:' . $request->userid);
            $start_time = $request->time;
            // if (Carbon::parse($prev_end_time)->gt(Carbon::parse($start_time))) {
            //     $start_time = Carbon::parse($start_time)->addSecond()->toTimeString();
            // }

            $data = TempTaskrunning::create([
                'userid' => $request->userid,
                'taskid' => $task->id,
                'description' => $request->description,
                'date' => $request->date,
                'time' => $start_time,
                'status' => $request->status ?? 'Closed',
                'category_id' => $category_id,
                'end_time' => $request->end_time ?? Carbon::now()->toTimeString(),
                'platform' => $request->platform ?? 'desktop',
                'type' => $request->type ?? 'actual',
            ]);

            Redis::set('prev:end_time:' . $request->userid, $request->end_time, 'EX', 1200);
            Redis::set('prev:description:' . $request->userid, $request->description, 'EX', 1200);
            Redis::set('prev:start_time:' . $request->userid, $request->time, 'EX', 1200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage(), 'status' => false], 500);
        }

        return response()->json([
            'message' => 'Log recordeda',
            'status' => true,
            'data' => [
                'id' => $data['id'],
            ],
        ], 201);
    }

    public function updateLog(Request $request)
    {
        try {
            $log = RunningApps::find($request->taskid);
            $log->end_time = $request->end_time;
            $log->status = 'Closed';
            $log->save();
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }

        // return response()->json(['message' => 'Log recorded', 'id' => $log->id], 201);
        return response()->json(['message' => 'Log updated'], 204);
    }

    public function getMinSpeed()
    {
        $up = Settings::where('type', 'UPSPEED')->first();
        $down = Settings::where('type', 'DOWNSPEED')->first();

        return response()->json([
            'data' => [
                'up' => $up->value,
                'down' => $down->value,
            ]
        ]);
    }

    public function getSettings()
    {
        $settingsapp = Settings::all();
        return response()->json([
            'data' => $settingsapp
        ]);
    }


    public function getNeutralApps(Request $request)
    {
        try {
            $request->validate([
                'date' => 'date|required',
                'teamId' => 'integer|required',
            ]);

            $date = Carbon::parse($request->date) ?? Carbon::now();
            $is_past = Carbon::now()->startOfDay()->gt($date);

            $redis_apps = Redis::get('neutral_apps:' . $request->teamId . ':' . $date->toDateString());

            if ($redis_apps != "[]" && $redis_apps != null) {
                return json_decode($redis_apps);
            }

            $data = [];
            $member_ids = Employee::where('team_id', $request->teamId)->pluck('id');

            RunningApps::where('category_id', 6)
                ->where('date', $request->date)
                ->whereIn('userid', $member_ids)
                ->limit(25)
                ->chunk(1000, function ($runningapps) use (&$data) {
                    foreach ($runningapps as $running) {
                        $employee = $running->employee;
                        $data[] = [
                            'userid' => $running->id,
                            'description' => $running->description,
                            'date' => $running->date,
                            'time' => $running->time,
                            'end_time' => $running->end_time,
                            'status' => $running->status,
                            'duration' => $running->duration,
                            'employee' => [
                                'id' => $employee->id,
                                'first_name' => $employee->first_name,
                                'last_name' => $employee->last_name,
                                'employee_id' => $employee->employee_id,
                            ],
                        ];
                    }
                });
            $ttl = $is_past ? 3600 : $this->seconds_ten_min_ttl;
            Redis::set('neutral_apps:' . $request->teamId . ':' . $date->toDateString(), json_encode($data), 'EX', $ttl);
        } catch (\Throwable $th) {
            throw $th;
        }

        return $data;
    }
}
