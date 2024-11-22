<?php

namespace App\Http\Controllers\Api;

use App\Jobs\TriggerGenerateJob;
use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Http\Resources\AppCategoriesResource;
use App\Http\Resources\EmployeeResource;
use App\Jobs\GenerateReportJob;
use App\Models\AccessRole;
use App\Models\AppCategories;
use App\Models\ExportHistory;
use App\Models\ExtractTrackingData;
use App\Models\ManagerTeam;
use App\Models\Position;
use App\Models\RunningApps;
use App\Models\Team;
use App\Models\TrackRecords;
use App\Models\RequestApproval;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redis;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    private $seconds_ten_min_ttl = 600; // 10min

    private $seconds_month_ttl = 86400; // 1d

    public function __construct()
    {
        ini_set('max_execution_time', 300);
    }
    /**
     * Display a listing of the resource.
     */
    public function index($teamid = null)
    {
        // return EmployeeResource::collection(Employee::query()->orderBy('id', 'desc')->paginate(10));

        // $employees = Employee::where('status', 'Approved')
        //     ->whereIn('id', function ($query) {
        //         $query->select('userid')
        //             ->from('tbltaskrunning')
        //             ->distinct()
        //             ->get();
        //     })->get();

        $employees = Auth::user()->positions()->with('employees')->get()->pluck('employees')->flatten();

        $data = [];
        foreach ($employees as $key => $emp) {
            $last_activity = RunningApps::where('userid', $emp->id)
                ->orderBy('id', 'desc')
                ->first();
            $emp->last_activity = $last_activity;
            $data[] = $emp;
        }

        return response()->json([
            'data' => $data,
            'message' => 'Successfully retrieved all employees',
        ], 200);
    }

    public function getAccounts()
    {
        $accounts = Employee::where('status', 'Approved')->paginate(10);
        return $accounts;
    }

    public function getPositions()
    {
        try {
            $positions = Position::where('active', true)->get();
        } catch (\Exception $e) {
            throw $e->getMessage();
        }

        return response()->json([
            'data' => $positions,
            'message' => 'Successfully retrieved all positions'
        ]);
    }

    public function getEmployeesStatus($teamid = null)
    {
        // $positions = Position::where('team_id', $teamid)->get();
        // $data = [];
        // foreach ($positions as $position) {
        //     for ($i = 0; $i < count($position->employees); $i++) {
        //         if ($position->employees[$i]->site == 'Dumaguete') {
        //             array_push($data, $position->employees[$i]);
        //         }
        //     }
        // }

        $teamid = $teamid ?? DB::table('manager_team_access')->first()->team_id;
        $data = Employee::where('team_id', $teamid)
            ->orderBy('last_name', 'asc')
            ->orderBy('first_name', 'asc')
            ->get();

        return response()->json([
            'data' => $data,
            'message' => 'Successfully retrieved all employees',
        ], 200);
    }

    public function getImageById($id)
    {
        $employee = Employee::find($id);
        return response()->make($employee->user_image)
            ->header('Content-Type', 'image/jpeg')
            ->header('Cache-Control', 'max-age=31536000');
    }

    public function getEmployeeById($id)
    {
        $employee = Employee::find($id);
        return response()->json([
            'data' => $employee,
            'message' => 'Success'
        ], 200);
    }
    public function getEmployeeByTeamID($team_id)
    {
        $employee = Employee::where('team_id', $team_id);
        return response()->json([
            'data' => $employee,
            'message' => 'Success'
        ], 200);
    }

    public function getTeams()
    {
        $manager_teams = ManagerTeam::where('manager_id', Auth::user()->id)->get();
        $teams = [];
        foreach ($manager_teams as $team) {
            $teams[] = Team::find($team->team_id);
        }

        return response()->json([
            'data' => $teams,
            'message' => 'Success'
        ], 200);
    }

    public function getEmployeesByTeam($id)
    {
        // $positions = Position::where('team_id', $id)->get();
        // $employees = [];
        // foreach ($positions as $postion) {
        //     foreach ($postion->employees as $emps) {
        //         if ($emps->site != 'Dumaguete') continue;

        //         $last_activity = RunningApps::where('userid', $emps->id)
        //             ->orderBy('id', 'desc')
        //             ->first();

        //         $emps->last_activity = $last_activity;
        //         array_push($employees, $emps);
        //     }
        // }

        $employees = Employee::where('team_id', $id)->get();

        foreach ($employees as $employee) {
            $last_activity = RunningApps::where('userid', $employee->id)
                ->orderBy('id', 'desc')
                ->first();
            $employee->last_activity = $last_activity;
        }

        return response()->json([
            'data' => $employees,
            'message' => 'Success'
        ], 200);
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
        $input = $request->all();

        /*
        $validator = Validator::make($input, [
            'name' => 'required',
            'detail' => 'required'
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors());
        }
        */

        $employee = Employee::create($input);

        return $this->sendResponse(new EmployeeResource($employee), 'Employee Created Successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return new EmployeeResource(Employee::findOrFail($id));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Employee $employee)
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

    /**
     * Display a listing of the employee resource absent.
     */
    public function absent()
    {
        // Get employees who are absent based on the absence of time logs
        $absentEmployees = Employee::whereDoesntHave('timeLogs', function ($query) {
            $query->where('created_at', '>=', now()->startOfDay())
                ->where('created_at', '<=', now()->endOfDay());
        })->orderBy('id', 'desc')->paginate(10);

        return EmployeeResource::collection($absentEmployees);
    }

    /**
     * Display a listing of the employee resource anomaly.
     */
    /*public function anomaly()
    {
        // Get employees who are absent based on the absence of time logs
        $anomalyEmployees = Employee::whereHas('anomalies', function ($query) {
            $query->where('action', 'IN')
                ->whereNotExists(function ($subQuery) {
                    $subQuery->select('id')
                        ->from('tbltime_logs as tl2')
                        ->whereRaw('tl2.emp_id = tbltime_logs.emp_id')
                        ->where('tl2.action', 'OUT')
                        ->whereRaw('DATE(tl2.created_at) = DATE(tbltime_logs.created_at)');
                })
                ->where('created_at', '>=', Carbon::now()->startOfMonth())
                ->where('created_at', '<=', Carbon::now()->subDays(1));
        })->orderBy('id', 'desc')->paginate(10);

        return EmployeeResource::collection($anomalyEmployees);
    }*/

    public function anomaly()
    {
        // Get employees who are anomaly based on the dateout of null time logs
        $anomalyEmployees = Employee::whereHas('anomalies', function ($query) {
            $query->whereNull('dateout')
                ->where('datein', '>=', Carbon::now()->startOfMonth())
                ->where('datein', '<=', Carbon::now()->subDays(1));
        })->orderBy('id', 'desc')->paginate(10);

        return EmployeeResource::collection($anomalyEmployees);
    }

    public function runningapps()
    {
        // Get employees productivity based on average
        $runningapps = Employee::whereHas('runningapps', function ($query) {
            $query->where('date', '>=', Carbon::now()->startOfDay())
                ->where('date', '<=', Carbon::now());
        })->orderBy('id', 'desc')->paginate(10);

        return EmployeeResource::collection($runningapps);
    }

    public function categories()
    {
        $categories = AppCategories::all();
        return AppCategoriesResource::collection($categories);
    }

    public function getEmployeeApps(Request $request)
    {
        $userid = '';
        $date = Carbon::now()->format('Y-m-d');
        if ($request->has('userid')) {
            $userid = $request->input('userid');
        }
        if ($request->has('date')) {
            $date = Carbon::createFromFormat('Y-m-d', $request->input('date'))->format('Y-m-d');
        }

        $employees = Employee::whereHas('runningapps', function ($query) use ($date) {
            $query->where('date', '=', $date);
        });
        if ($userid != '') {
            $employees->where('id', $userid);
        }
        $employees = $employees->orderBy('id', 'desc')->get();
        $categories_data = AppCategories::all();
        $appCategories = [];
        foreach ($categories_data as $category) {
            $appCategories[$category->id] = $category;
        }

        foreach ($employees as $key => $emp) {
            $categories['unproductive'] = [];
            $categories['productive'] = [];
            $categories['neutral'] = [];
            foreach ($emp->runningapps as $app) {
                $app['epoch'] = Carbon::createFromFormat('Y-m-d H:i:s', $app->date . ' ' . $app->time)->timestamp;
                //$app['original'] = Carbon::createFromTimestamp($app['epoch'])->toDateTimeString();
                if (array_key_exists($app->category_id, $appCategories)) {
                    $category = $appCategories[$app->category_id];
                    $app['category'] = $category;
                    if ($category->is_productive == 0) {
                        $categories['unproductive'][] = $app;
                    } else if ($category->is_productive == 1) {
                        $categories['productive'][] = $app;
                    } else {
                        $categories['neutral'][] = $app;
                    }
                } else {
                    $categories['unproductive'][] = $app;
                }
            }
            $employees[$key]->offsetUnset('runningapps');
            $employees[$key]['runningapps'] = $categories;
        }

        return response()->json([
            'data' => $employees,
            'message' => 'Success'
        ], 200);
    }

    public function getProductivity(Request $request)
    {
        $userid = '';
        $date = Carbon::now()->format('Y-m-d');
        if ($request->has('userid')) {
            $userid = $request->input('userid');
        }
        if ($request->has('date')) {
            // $date = Carbon::createFromFormat('Y-m-d', $request->date)->format('Y-m-d');
            $date = Carbon::parse($request->date)->format('Y-m-d');
        }

        $productivity = [0, 0];
        $categories_data = AppCategories::all();
        $appCategories = [];
        foreach ($categories_data as $category) {
            $appCategories[$category->id] = $category;
        }
        //DB::connection()->enableQueryLog();
        $queries = DB::table('tbltaskrunning');
        $queries->select(DB::raw('HOUR(time) AS start_time'));
        if ($userid != '') {
            $queries->where('userid', $userid);
        }
        $queries->where('date', '=', $date)
            ->orderBy('time')
            ->limit(1);
        $start_time = $queries->get();
        //$queries = DB::getQueryLog();
        //print_r($queries);

        if (count($start_time) > 0) {
            foreach ($start_time as $start) {
                $productivity[0] = $start->start_time;
                $end = $start->start_time + 9;
                if ($end > 24) {
                    $end = $end - 24;
                }
                $current = date('H');
                if ($current > $end) {
                    $end = $current;
                }
                $productivity[1] = $end;
            }
        } else {
            $start = date('H');
            $productivity[0] = $start;
            $end  = $start + 9;
            if ($end > 24) {
                $end = $end - 24;
            }
            $productivity[1] = $start + 9;
        }

        for ($i = $productivity[0]; $i <= $productivity[1]; $i++) {
            $categories[$i]['unproductive'] = 0;
            $categories[$i]['productive'] = 0;
            $categories[$i]['neutral'] = 0;
            DB::connection()->enableQueryLog();
            $runningapps = DB::table('tbltaskrunning');
            $runningapps->select(
                'userid',
                'category_id',
                DB::raw('SUM(HOUR(SUBTIME(IF(ISNULL(end_time), CURRENT_TIME, end_time), `time`))) / COUNT(userid) AS usage_time')
            );
            if ($userid != '') {
                $runningapps->where('userid', $userid);
            }
            $runningapps = $runningapps->where('time', '>=', $i . ':00:00')
                ->where('time', '<=', $i . ':59:59')
                ->where('date', '=', $date)
                ->groupBy('userid', 'category_id')
                ->get();
            $queries = DB::getQueryLog();
            //print_r($queries);

            foreach ($runningapps as $key => $app) {

                if (array_key_exists($app->category_id, $appCategories)) {
                    $category = $appCategories[$app->category_id];
                    if ($category->is_productive == 0) {
                        $categories[$i]['unproductive'] += $app->usage_time;
                    } else if ($category->is_productive == 1) {
                        $categories[$i]['productive'] += $app->usage_time;
                    } else {
                        $categories[$i]['neutral'] += $app->usage_time;
                    }
                } else {
                    $categories[$i]['unproductive'] += $app->usage_time;
                }
            }
        }

        return response()->json([
            'data' => $categories,
            'message' => 'Success'
        ], 200);
    }

    public function getAllDailyOpenedApps(Request $request)
    {
        $request->validate([
            'teamId' => 'required|exists:teams,id',
            'date' => 'date',
        ]);

        $date = Carbon::parse($request->date) ?? Carbon::now();
        $is_past = Carbon::now()->startOfDay()->gt($date);

        $redis_apps = Redis::get('admin_apps:' . $request->teamId . ':' . $date->toDateString());

        if ($redis_apps != "[]" && $redis_apps != null)
            return response()->json([
                'count' => count(json_decode($redis_apps)),
                'redis' => 'hit',
                'data' => json_decode($redis_apps),
                'date' => $date->toDateString(),
            ]);

        $emps_under = Employee::select('id')
            ->where('team_id', $request->teamId)->get();

        $data = [];
        RunningApps::with('employee', 'category')
            ->where('date', $date->toDateString())
            ->whereColumn('time', '<', 'end_time')
            ->whereIn('userid', $emps_under)
            // ->whereIn('category_id', $categories)
            // ->limit(100) // must disabled
            ->chunk(1000, function ($runningapps) use (&$data) {
                foreach ($runningapps as $running) {
                    $employee = $running->employee;
                    $category = $running->category;
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
                            'name' => $employee->getFullNameAttribute(),
                            'employee_id' => $employee->employee_id,
                        ],
                        'category' => [
                            'id' => $category->id,
                            'name' => $category->name,
                            'is_productive' => $category->is_productive,
                            'header_name' => $category->header_name,
                            'icon' => $category->icon,
                            'abbreviation' => $category->abbreviation,
                        ]
                    ];
                }
            });

        $ttl = $is_past ? 3600 : $this->seconds_ten_min_ttl;
        Redis::set('admin_apps:' . $request->teamId . ':' . $date->toDateString(), json_encode($data), 'EX', $ttl);

        return response()->json([
            'count' => count($data),
            'redis' => 'miss',
            'date' => $date->toDateString(),
            'data' => $data ?? [],
            'message' => 'Success'
        ], 200);
    }

    public function getAllDailyOpenedByCategory(Request $request)
    {
        $request->validate([
            'teamId' => 'required|exists:teams,id',
            'date' => 'date',
        ]);

        $date = Carbon::parse($request->date) ?? Carbon::now();
        $is_past = Carbon::now()->startOfDay()->gt($date);

        if (!request()->has('empId')) {

            $redis_apps = Redis::get('category_apps:' . $request->teamId . ':' . $date->toDateString() . ':' . $request->isProductive);

            if ($redis_apps != "[]" && $redis_apps != null)
                return response()->json([
                    'count' => count(json_decode($redis_apps)),
                    'redis' => 'hit',
                    'data' => json_decode($redis_apps),
                    'date' => $date->toDateString(),
                ]);

            $emps_under = Employee::select('id')
                ->where('team_id', $request->teamId)->get();
        } else {
            $emps_under = [$request->empId];
        }

        $categories = AppCategories::select('id')
            ->where('is_productive', $request->isProductive)->get();

        $data = [];
        RunningApps::with('employee', 'category')
            ->where('date', $date->toDateString())
            ->whereColumn('time', '<', 'end_time')
            ->whereIn('userid', $emps_under)
            ->whereIn('category_id', $categories)
            // ->limit(100) // must disabled
            ->chunk(1000, function ($runningapps) use (&$data) {
                foreach ($runningapps as $running) {
                    $employee = $running->employee;
                    $category = $running->category;
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
                            'name' => $employee->getFullNameAttribute(),
                            'employee_id' => $employee->employee_id,
                        ],
                        'category' => [
                            'id' => $category->id,
                            'name' => $category->name,
                            'is_productive' => $category->is_productive,
                            'header_name' => $category->header_name,
                            'icon' => $category->icon,
                            'abbreviation' => $category->abbreviation,
                        ]
                    ];
                }
            });

        if (!request()->has('empId')) {
            $ttl = $is_past ? 3600 : $this->seconds_ten_min_ttl;
            Redis::set('category_apps:' . $request->teamId . ':' . $date->toDateString() . ':' . $request->isProductive, json_encode($data), 'EX', $ttl);
        }

        return response()->json([
            'count' => count($data),
            'redis' => 'miss',
            'date' => $date->toDateString(),
            'data' => $data ?? [],
            'message' => 'Success'
        ], 200);
    }

    public function getUserForApproval()
    {
        try {
            $emps_under = Auth::user()->positions()->with('employees')->get()
                ->pluck('employees')->flatten()->pluck('id')->toArray();

            $special_access = AccessRole::where('role', 'USER_APPROVAL')->first();

            if ($special_access) {
                $users = Employee::where('status', 'Pending')
                    ->orderBy('id', 'desc')
                    ->get();
            } else {
                $users = Employee::whereIn('id', $emps_under)
                    ->whereIn('status', ['Pending', 'Rejected'])
                    ->orderBy('id', 'desc')
                    ->get();
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }

        return response()->json([
            'data' => $users ?? [],
            'message' => 'Success'
        ], 200);
    }

    public function getWorkHrs($date = null, $teamid = null)
    {
        try {
            // $emps_under = Auth::user()->positions()->with('employees')->get()
            //     ->pluck('employees')->flatten()->pluck('id')->toArray();

            // $positions = Position::where('team_id', $teamid)->get();
            // $emps_under = [];
            // foreach ($positions as $position) {
            //     foreach ($position->employees as $emps) {
            //         if ($emps->site != 'Dumaguete') continue;
            //         array_push($emps_under, $emps->id);
            //     }
            // }

            $emps_under = Employee::where('team_id', $teamid)->pluck('id')->toArray();

            $date = $date ?? Carbon::now()->toDateString();
            $work_hrs = TrackRecords::with('employee')
                ->whereIn('userid', $emps_under)
                ->where('datein', Carbon::parse($date)->toDateString())
                ->get();

            $data = [];
            $endest = '23:59:59';
            foreach ($work_hrs as $track) {
                if ($track->timeout != null && ($track->timein > $track->timeout)) {
                    $track->timeout = $endest;

                    $tmp = TrackRecords::find($track->id);
                    $tmp->timeout = $endest;
                    $tmp->dateout = Carbon::parse($date)->toDateString();
                    $tmp->save();
                }

                $data[] = $track;
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Internal Server Error!',
            ], 500);
        }

        return response()->json([
            'data' => $work_hrs ?? [],
            'message' => count($work_hrs) > 0 ? 'Success' : 'Employee not found',
            'total' => count($emps_under),
            'emps' => $emps_under
        ], 200);
    }

    public function getTimeLogByEmployee($id, $date = null)
    {
        try {
            $date = $date ?? Carbon::now()->toDateString();
            $track_records = TrackRecords::with('employee')
                ->where('userid', $id)
                ->where('datein', Carbon::parse($date)->toDateString())
                ->get();

            $work_hrs = $track_records->first();
            if (count($track_records) > 1) {
                $work_hrs->timeout = $track_records->last()->timeout;
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Internal Server Error!',
            ], 500);
        }

        return response()->json([
            'data' => $work_hrs ?? [],
            'message' => $work_hrs ? 'Success' : 'Employee not found',
        ]);
    }

    public function getAttendanceReport($from, $to = null)
    {
        try {
            $from = $from ?? Carbon::now()->toDateString();
            $to = $to ?? Carbon::now()->toDateString();
            $work_hrs = TrackRecords::with('employee')
                ->whereIn('userid', request('employees'))
                ->whereBetween('datein', [$from, $to])
                ->get();
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Internal Server Error!',
            ], 500);
        }

        return response()->json([
            'data' => $work_hrs ?? [],
            'message' => count($work_hrs) > 0 ? 'Success' : 'Records not found',
        ]);
    }

    public function getAttendance($from, $to = null)
    {
        try {
            $from = $from ?? Carbon::now()->toDateString();
            $to = $to ?? Carbon::now()->toDateString();
            $work_hrs = TrackRecords::with('employee')
                ->whereHas('employee', function ($query) {
                    $query->whereIn('employee_id', request('employees'));
                })
                ->whereBetween('datein', [$from, $to])
                ->get();
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Internal Server Error!',
            ], 500);
        }

        return response()->json([
            'data' => $work_hrs ?? [],
            'message' => count($work_hrs) > 0 ? 'Success' : 'Records not found',
        ]);
    }

    public function getTrackingReport($from, $to = null)
    {
        // try {
        $from = Carbon::parse($from)->toDateString();
        $to = $to ?? Carbon::now()->toDateString();
        $data = [];

        foreach (request('employees') as $employee) {
            $data[] = $employee;
        }

        $items = TrackRecords::with('employee')
            ->whereIn('userid', request('employees'))
            ->whereBetween('datein', [$from, $to])
            ->whereNot('dateout', null)
            ->get();

        $export = ExportHistory::create([
            'userid' => Auth::user()->id ?? request('manager_id'),
            'type' => request('type') ?? 'tracking',
            'employees' => json_encode(request('employees')),
            'start_date' => $from,
            'end_date' => $to,
            'item_count' => count($items),
            'team_name' => Team::find(request('teamId'))->name ?? 'utils'
        ]);

        foreach ($items as $track) {
            # code...
            $extract = ExtractTrackingData::create([
                'user_id' => $export->userid,
                'report_id' => $export->id,
                'employee_id' => $track->userid,
                'date' => $track->datein,
                'time_in' => $track->timein,
                'time_out' => $track->timeout,
                'productive_duration' => 0,
                'unproductive_duration' => 0,
                'neutral_duration' => 0,
            ]);

            if ($extract) {
                GenerateReportJob::dispatchSync($export, $track, $extract);
                TriggerGenerateJob::dispatchSync($extract);
            }
        }
        // } catch (\Exception $e) {
        //     return response()->json([
        //         'error' => $e->getMessage(),
        //         'message' => 'Internal Server Error!',
        //     ], 500);
        // }

        // $data_count = count($items);
        // return response()->json([
        //     'data' => $items ?? [],
        //     'message' => $data_count > 0 ? 'Success' : 'Records not found',
        //     'count' => $data_count,
        // ]);
    }

    public function getApplicationReport($from, $to = null)
    {
        try {
            $from = Carbon::parse($from)->toDateString();
            $to = $to ?? Carbon::now()->toDateString();
            $work_hrs = RunningApps::with('category', 'employee')
                ->whereBetween('date', [$from, $to])
                ->whereIn('userid', request('employees'))
                ->where('status', 'Closed')
                ->select(['*', DB::raw("TIMESTAMPDIFF(SECOND, time, end_time) as duration")])
                ->get();

            $data = $work_hrs->groupBy('userid');
            $items = [];
            foreach (request('employees') as $emps) {
                if (!isset($data[$emps])) continue;
                $items[] = [
                    'userid' => $emps,
                    'info' => $data[$emps]->groupBy('category.header_name')
                ];
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Internal Server Error!',
            ], 500);
        }

        return response()->json([
            'data' => $items ?? [],
            // 'data' => $work_hrs ?? [],
            // 'message' => count($work_hrs) > 0 ? 'Success' : 'Records not found',
        ]);
    }

    public function getWeeklyUtilization($date = null, $teamid = null)
    {
        $date = Carbon::parse($date) ?? Carbon::now();
        $day_of_week = Carbon::parse($date)->dayOfWeek;
        $date_from = Carbon::parse($date)->subDays($day_of_week);
        $date_to = Carbon::parse($date)->addDays(6 - $day_of_week);
        $employees = Employee::where('team_id', $teamid)->get();
        $ids = $employees->pluck('id')->toArray();

        $data = [];
        $no_data = [];

        TrackRecords::with('employee')
            ->whereIn('userid', $ids)
            ->whereBetween('datein', [$date_from->toDateString(), $date_to->toDateString()])
            ->chunk(1000, function ($tracks) use (&$data, &$no_data) {
                foreach ($tracks as $track) {
                    $employee = $track->employee;
                    $extract = ExtractTrackingData::where('employee_id', $track->userid)
                        ->where('date', $track->datein)
                        ->orderBy('productive_duration', 'desc')
                        ->first();

                    if (!$extract) $no_data[] = $track->userid;

                    $data[] = [
                        'id' => $track->id,
                        'userid' => $track->userid,
                        'datein' => $track->datein,
                        'timein' => $track->timein,
                        'timeout' => $track->end_time,
                        'dateout' => $track->dateout,
                        'employee' => $employee,
                        'productivity' => $extract ?? 'pending'
                    ];
                }
            });

        return response()->json([
            'data' => $data ?? [],
            // 'message' => count($data) > 0 ? 'Success' : 'Records not found',
            'range' => [
                'from' => $date_from->toDateString(),
                'to' => $date_to->toDateString()
            ],
            'employees' => $employees,
        ]);
    }


    public function getWeeklyAttendance($date = null, $teamid = null)
    {
        try {
            $date = Carbon::parse($date) ?? Carbon::now();
            $day_of_week = Carbon::parse($date)->dayOfWeek;
            $date_from = Carbon::parse($date)->subDays($day_of_week);
            $date_to = Carbon::parse($date)->addDays(6 - $day_of_week);
            $employees = Employee::where('team_id', $teamid)->get();
            $ids = $employees->pluck('id')->toArray();

            // Get employees weekly attendance
            $attendance = TrackRecords::with('employee')
                ->whereIn('userid', $ids)
                ->whereBetween('datein', [$date_from->toDateString(), $date_to->toDateString()])
                ->get();
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Internal Server Error!',
            ], 500);
        }

        return response()->json([
            'data' => $attendance ?? [],
            'message' => count($attendance) > 0 ? 'Success' : 'Records not found',
            'range' => [
                'from' => $date_from->toDateString(),
                'to' => $date_to->toDateString()
            ],
            'employees' => $employees,
        ]);
    }

    public function getInfoByEmployeeIdV($empid, $version)
    {
        try {
            if ($empid == 'Kenneth')
                $empid = 'PH0067';

            $employee = Employee::where('employee_id', $empid)->first();
            if (!$employee)
                return response()->json([
                    'message' => 'Employee not found',
                ], 404);

            if ($employee->id === 0)
                throw new \Exception('Employee not found');
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Internal Server Error!',
            ], 500);
        }

        if (!$version) {
            $employee->version = $version;
            $employee->save();
        }



        return response()->json([
            'data' => $employee ?? null,
            'message' => $employee ? 'Success' : 'Records not found',
        ], 200);
    }
    public function getInfoByEmployeeIdVV($empid, $version, $updator_version)
    {
        try {
            if ($empid == 'Kenneth')
                $empid = 'PH0067';

            $employee = Employee::where('employee_id', $empid)->first();
            if (!$employee)
                return response()->json([
                    'message' => 'Employee not found',
                ], 404);

            if ($employee->id === 0)
                throw new \Exception('Employee not found');
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Internal Server Error!',
            ], 500);
        }

        if (!empty($updator_version)) {
            $employee->updator_version = $updator_version;
        }

        // Update the employee's version if provided
        if (!empty($version)) {
            $employee->version = $version;
        }

        // Save the employee only if there were changes
        if (!empty($updator_version) || !empty($version)) {
            $employee->save();
        }



        return response()->json([
            'data' => $employee ?? null,
            'message' => $employee ? 'Success' : 'Records not found',
        ], 200);
    }
    public function getInfoByEmployeeIdVVV(Request $request)
    {
        try {
            $empid = null;
            if ($request->employee_id == 'Kenneth')
                $empid = 'PH0067';
            else
                $empid = $request->employee_id;

            $employee = Employee::where('employee_id', $empid)->first();
            if (!$employee)
                return response()->json([
                    'message' => 'Employee not found',
                ], 404);

            if ($employee->id === 0)
                throw new \Exception('Employee not found');
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Internal Server Error!',
            ], 500);
        }

        $employee->updator_version = $request->updator_version;
        $employee->save();

        $employee->version = $request->version;
        $employee->save();




        return response()->json([
            'data' => $employee ?? null,
            'message' => $employee ? 'Success' : 'Records not found',
        ], 200);
    }
    public function getInfoByEmployeeIdWV($empid)
    {
        try {
            if ($empid == 'Kenneth')
                $empid = 'PH0067';

            $employee = Employee::where('employee_id', $empid)->first();
            if (!$employee)
                return response()->json([
                    'message' => 'Employee not found',
                ], 404);

            if ($employee->id === 0)
                throw new \Exception('Employee not found');
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Internal Server Error!',
            ], 500);
        }


        return response()->json([
            'data' => $employee ?? null,
            'message' => $employee ? 'Success' : 'Records not found',
        ], 200);
    }
    public function getInfoByEmployeeId($empid)
    {
        try {
            if ($empid == 'Kenneth')
                $empid = 'PH0067';

            $employee = Employee::where('employee_id', $empid)->first();
            if (!$employee)
                return response()->json([
                    'message' => 'Employee not found',
                ], 404);

            if ($employee->id === 0)
                throw new \Exception('Employee not found');
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Internal Server Error!',
            ], 500);
        }

        return response()->json([
            'data' => $employee ?? null,
            'message' => $employee ? 'Success' : 'Records not found',
        ], 200);
    }
    public function getInfoByEmployeeIdwithImage($empid)
    {
        try {
            if ($empid == 'Kenneth')
                $empid = 'PH0067';

            $employee = Employee::where('employee_id', $empid)->first();
            if (!$employee) {
                return response()->json([
                    'message' => 'Employee not found',
                ], 404);
            }

            if ($employee->id === 0) {
                throw new \Exception('Employee not found');
            }

            // Ensure 'image' column exists and contains data
            //$imageData = $employee->user_image ? base64_encode($employee->user_image) : null;

            return response()->json([
                'data' => [
                    'employee' => $employee,
                    'user_image' => $employee->user_image
                ],
                'message' => 'Success'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Internal Server Error!',
            ], 500);
        }
    }

    public function getEmployeeLog($empid, $date = null, $category_id = [])
    {
        try {
            if ($empid == 'Kenneth') $empid = 'PH0067';
            $date = Carbon::parse($date) ?? Carbon::now();

            // $employee = Employee::find($empid);
            if (!$empid)
                throw new \Exception('Employee not found');

            $employee = Employee::where('employee_id', $empid)->first();
            if (!$employee)
                throw new \Exception('Employee ID ' . $empid . ' not found');

            $log = RunningApps::where('userid', $employee->id)
                ->where('date', $date->toDateString());

            if (count($category_id) > 0) {
                $log = $log->whereIn('category_id', $category_id);
            }

            $start = $log->orderBy('time')->get();
            $end = $log->whereNot('end_time', null)->orderBy('time')->get();
            $count = $log->count();
        } catch (\Exception $e) {
            return [
                'error' => $e->getMessage(),
                'message' => 'Internal Server Error!',
            ];
        }

        return $log->count() == 0 ? [] : [
            'start' => $start[0],
            'end' => $end[$count - 1],
            'date' => $date->toDateString(),
        ];
    }

    public function getEmployeeActivity($empid, $date = null)
    {
        try {
            // $categories = AppCategories::all();
            // $all = $this->getEmployeeLog($empid, $date);
            // $productive = $this->getEmployeeLog($empid, $date, $categories->where('is_productive', 1)
            //     ->pluck('id')->toArray());
            // $unproductive = $this->getEmployeeLog($empid, $date, $categories->where('is_productive', 0)
            //     ->pluck('id')->toArray());
            // $neutral = $this->getEmployeeLog($empid, $date, [6]);

            $user = Employee::where('employee_id', $empid)->first();

            $track = TrackRecords::where('userid', $user->id)
                ->where('datein', $date)
                ->orderBy('id', 'DESC')
                ->first();

            if (!$track)
                return [
                    'data' => []
                ];

            $first = RunningApps::where('userid', $user->id)
                ->where('taskid', $track->id)
                ->orderBy('time', 'ASC')
                ->first();

            $last = RunningApps::where('userid', $user->id)
                ->where('taskid', $track->id)
                ->orderBy('time', 'DESC')
                ->first();
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Internal Server Error!',
            ]);
        }

        return response()->json([
            'data' => [
                'all' => [
                    'start' => $first,
                    'end' => $last,
                    'date' => $date,
                ],
                // 'productive' => $productive,
                // 'unproductive' => $unproductive,
                // 'neutral' => $neutral
            ]
        ]);
    }

    public function recentLogs(Request $request)
    {
        $request->validate([
            'userid' => 'exists:accounts,id|required',
            'date' => 'date',
            'count' => 'numeric'
        ]);

        $limit = request()->has('count') ? $request->count : 20;
        $data = RunningApps::where('userid', $request->userid)
            ->where('date', $request->date)
            ->limit($limit)
            ->orderBy('time', 'DESC')
            ->get();

        return response()->json([
            'data' => $data,
            'count' => count($data)
        ]);
    }

    public function getAllEmployees()
    {
        $employees = Employee::all();
        return response()->json([
            'data' => $employees
        ]);
    }

    public function insertRequestApproval(Request $request)
    {

        $employee1 = Employee::where('id', $request->userid)->first();
        $requestApproval = RequestApproval::create([
            'managerid' => $employee1->team_id,
            'status' => $request->status ?? 'Pending',
            'userid' => $request->userid,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'description' => $request->description,
            'duration' => $request->duration
        ]);
        return response()->json([
            'data' => $requestApproval
        ]);
    }
    public function insertRequestApprovaltest(Request $request)
    {

        $employee1 = Employee::where('id', $request->userid)->first();
        $requestApproval = RequestApproval::create([
            'managerid' => $employee1->team_id,
            'status' => $request->status ?? 'Pending',
            'userid' => $request->userid,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'description' => $request->description,
            'duration' => $request->duration
        ]);
        return response()->json([
            'data' => $requestApproval
        ]);
    }

    public function getAllRequest(Request $request)
    {

        $UserForApproval = RequestApproval::where('userid', $request->userid)
            ->where('date', $request->date)
            ->orderBy('id', 'DESC')
            ->get();

        return response()->json([
            'data' => $UserForApproval
        ]);
    }

    public function getAllRequestWManager(Request $request)
    {

        /* $UserForApproval = RequestApproval::where('managerid', $request->managerid)
            ->where('date', $request->date)
            ->orderBy('id', 'DESC')
            ->get();

        return response()->json([
            'data' => $UserForApproval
        ]);*/


        $UserForApproval = RequestApproval::with('employee')
            ->where('managerid', $request->managerid)
            ->where('date', $request->date)
            ->orderBy('id', 'DESC')
            ->get();

        return response()->json([
            'data' => $UserForApproval->map(function ($requestApproval) {
                return [
                    'id' => $requestApproval->id,
                    'userid' => $requestApproval->userid,
                    'user_name' => $requestApproval->employee->full_name, // Assuming you have a full_name accessor in Employee model
                    'managerid' => $requestApproval->managerid,
                    'description' => $requestApproval->description,
                    'status' => $requestApproval->status,
                    'notes' => $requestApproval->notes,
                    'start_time' => $requestApproval->start_time,
                    'end_time' => $requestApproval->end_time,
                    'date' => $requestApproval->date,
                    'created_at' => $requestApproval->created_at,
                    'updated_at' => $requestApproval->updated_at,
                    'duration' => $requestApproval->duration
                ];
            })
        ]);
    }

    public function updateTransactionStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|integer|exists:request_approval,id',
            'status' => 'required|in:Approved,Rejected',
            'managerid' => 'required|integer|exists:request_approval,managerid'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        $approval = RequestApproval::where('id', $request->id)
            ->where('managerid', $request->managerid)
            ->first();

        if (!$approval) {
            return response()->json(['error' => 'Request not found or you do not have permission to update this request.'], 404);
        }

        $approval->status = $request->status;
        $approval->save();

        return response()->json([
            'message' => 'Status updated successfully',
            'data' => [
                'id' => $approval->id,
                'userid' => $approval->userid,
                'user_name' => $approval->employee->full_name,
                'managerid' => $approval->managerid,
                'description' => $approval->description,
                'status' => $approval->status,
                'notes' => $approval->notes,
                'start_time' => $approval->start_time,
                'end_time' => $approval->end_time,
                'date' => $approval->date,
                'created_at' => $approval->created_at,
                'updated_at' => $approval->updated_at,
                'duration' => $approval->duration
            ]
        ]);
    }


    public function getRequestbyid(Request $request)
    {



        $UserForApproval = RequestApproval::where('id', $request->id)
            ->first();

        return response()->json([
            'data' => $UserForApproval,
            'message' => $UserForApproval ? 'Success' : 'Records not found',
        ]);
    }


    public function updateUserForApproval(Request $request)
    {

        $user = Employee::find($request->id);
        $user->status = $request->status;
        $user->save();

        return $user;
    }
    public function updateUserForApprovalbyId(Request $request)
    {
        $user = RequestApproval::find($request->id);
        $user->status = $request->status;
        $user->notes = $request->notes;
        $user->save();
        return $user;
    }


    public function updateuserImages(Request $request)
    {
        $user = Employee::where('employee_id', $request->input('employee_id'))->first();
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Update the user_image with the base64 string
        $user->user_image = $request->input('user_image');

        // Save the user model
        $user->save();

        return response()->json($user);
    }
}
