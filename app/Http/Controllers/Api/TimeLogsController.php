<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use App\Models\TimeLogs;
use App\Models\RunningApps;

use App\Http\Resources\TimeLogResource;
use App\Http\Requests\StoreTimeLogsRequest;
use App\Http\Requests\UpdateTimeLogsRequest;
use App\Models\TrackRecords;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Http\Request;

class TimeLogsController extends Controller
{
    private $start = 0;

    private $end = 0;

    private $seconds_ten_min_ttl = 600; // 10min

    private $seconds_month_ttl = 86400; // 1d

    public function __construct()
    {
        date_default_timezone_set(config('app.timezone'));
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return TimeLogResource::collection(TimeLogs::query()->orderBy('id', 'desc')->paginate(10));
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
    public function store(StoreTimeLogsRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(TimeLogs $timeLogs)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TimeLogs $timeLogs)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTimeLogsRequest $request, TimeLogs $timeLogs)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TimeLogs $timeLogs)
    {
        //
    }

    public function redisGraphData($empid, $date = null)
    {
        $date = Carbon::parse($date) ?? Carbon::now();
        $redis_apps = Redis::hget('graph:' . $empid, $date->toDateString());

        if ($redis_apps != null) {
            return response()->json([
                'redis' => 'hit',
                'data' => json_decode($redis_apps)
            ]);
        } else {
            $apps = RunningApps::with('category')
                ->where('date', $date->toDateString())
                ->where('userid', $empid)
                ->where('status', 'Closed')
                ->whereNot('end_time', null)
                ->select([
                    '*',
                    DB::raw("TIMESTAMPDIFF(SECOND, time, end_time) as duration"),
                    DB::raw("hour(time) as hour")
                ])
                ->get();

            Redis::hset('graph:' . $empid, $date->toDateString(), $apps);
        }

        return response()->json([
            'redis' => 'miss',
            'data' => $apps,
        ]);
    }

    public function graphData($empid, $date = null)
    {
        $needles = [];

        $date = Carbon::parse($date) ?? Carbon::now();
        // $is_past = Carbon::now()->startOfDay()->gt($date);

        // string
        // $redis_apps = Redis::get('graph:' . $empid . ':' . $date->toDateString());

        // hash
        // $redis_apps = Redis::hget('graph:'.$empid, $date->toDateString());

        // if ($redis_apps != "[]" && $redis_apps != null) {
        //     return response()->json([
        //         'redis' => 'hit',
        //         'data' => json_decode($redis_apps),
        //     ]);
        // }

        $apps = RunningApps::with('category')
            ->where('date', $date->toDateString())
            ->where('userid', $empid)
            ->where('status', 'Closed')
            ->whereNot('end_time', null)
            ->select([
                '*',
                DB::raw("TIMESTAMPDIFF(SECOND, time, end_time) as duration"),
                DB::raw("hour(time) as hour")
            ])
            ->get();

        $data_tmp = $apps->groupBy('category.is_productive');
        // $type_keys = $data_tmp->keys();
        $type_keys = [0, 1, 2];

        $types_ = [
            '0' => 'unproductive',
            '1' => 'productive',
            '2' => 'neutral',
        ];

        $types = ['unproductive', 'productive', 'neutral'];
        foreach ($type_keys as $t) {
            $types[$t] = $types_[$t];
            if (!array_key_exists($t, $data_tmp->toArray())) {
                $data_tmp[(string)$t] = [];
            }
        }

        foreach ($types as $int => $type) {
            $hours = [];
            $seconds = [];
            foreach ($data_tmp[(string)$int] as $item) {
                $hour_ = Carbon::parse("{$item->hour}:00:00")->format('H:i');
                if (in_array($hour_, $hours)) {
                    $seconds[$hour_] += $item->duration;
                } else {
                    $hours[] = $hour_;
                    $seconds[$hour_] = $item->duration;
                }
            }
            $needles[$type] = [
                'label' => $hours,
                'value' => array_values($seconds),
            ];
        }

        // $ttl = $is_past ? $this->seconds_month_ttl : $this->seconds_ten_min_ttl;
        // Redis::set('graph:' . $empid . ':' . $date->toDateString(), json_encode($needles), 'EX', $ttl);

        return response()->json([
            // 'redis' => 'miss',
            'data' => count($needles) ? $needles : [
                'productive' => [
                    'label' => [],
                    'value' => []
                ],
                'neutral' => [
                    'label' => [],
                    'value' => []
                ],
                'unproductive' => [
                    'label' => [],
                    'value' => []
                ],
            ],
        ]);
    }

    public function testGraphData($empid, $date = null)
    {
        $needles = [];
        $date = Carbon::parse($date) ?? Carbon::now();

        $apps = RunningApps::with('category')
            ->where('date', $date->toDateString())
            ->where('userid', $empid)
            ->where('status', 'Closed')
            ->whereNot('end_time', null)
            ->select([
                '*',
                DB::raw("TIMESTAMPDIFF(SECOND, time, end_time) as duration"),
                DB::raw("hour(time) as hour")
            ])
            ->get();

        $data_tmp = $apps->groupBy('category.is_productive');
        // $type_keys = $data_tmp->keys();
        $type_keys = [0, 1, 2];

        $types_ = [
            '0' => 'unproductive',
            '1' => 'productive',
            '2' => 'neutral',
        ];

        $types = ['unproductive', 'productive', 'neutral'];
        foreach ($type_keys as $t) {
            $types[$t] = $types_[$t];
            if (!array_key_exists($t, $data_tmp->toArray())) {
                $data_tmp[(string)$t] = [];
            }
        }

        foreach ($types as $int => $type) {
            $hours = [];
            $seconds = [];
            foreach ($data_tmp[(string)$int] as $item) {
                $hour_ = Carbon::parse("{$item->hour}:00:00")->format('H:i');
                if (in_array($hour_, $hours)) {
                    $seconds[$hour_] += $item->duration;
                } else {
                    $hours[] = $hour_;
                    $seconds[$hour_] = $item->duration;
                }
            }
            $needles[$type] = [
                'label' => $hours,
                'value' => array_values($seconds),
            ];
        }

        // $ttl = $is_past ? $this->seconds_month_ttl : $this->seconds_ten_min_ttl;
        // Redis::set('graph:' . $empid . ':' . $date->toDateString(), json_encode($needles), 'EX', $ttl);

        return response()->json([
            // 'redis' => 'miss',
            'data' => count($needles) ? $needles : [
                'productive' => [
                    'label' => [],
                    'value' => []
                ],
                'neutral' => [
                    'label' => [],
                    'value' => []
                ],
                'unproductive' => [
                    'label' => [],
                    'value' => []
                ],
            ],
        ]);
    }

    public function getAppData(Request $request)
    {
        $request->validate([
            'userid' => 'required|exists:accounts,id',
        ]);

        $userid = $request->userid;
        $date = Carbon::parse($request->date) ?? Carbon::now();

        $redis_apps = Redis::get('appdata:' . $userid . ':' . $date->toDateString());
        if ($redis_apps != "[]" && $redis_apps != null) {
            return response()->json([
                'data' => json_decode($redis_apps),
                'message' => 'Success',
                'redis' => true,
            ], 200);
        }

        $apps = RunningApps::with('category')
            ->where('date', $date->toDateString())
            ->where('userid', $userid)
            ->where('status', 'Closed')
            ->whereNot('end_time', null)
            ->get();

        $data_tmp = $apps->groupBy('category.is_productive');
        // $keys = $data_tmp->keys();

        $type_keys = [0, 1, 2];

        $types_ = [
            '0' => 'unproductive',
            '1' => 'productive',
            '2' => 'neutral',
        ];

        $types = ['unproductive', 'productive', 'neutral'];

        $apps = [];
        foreach ($type_keys as $t) {
            if (!array_key_exists($t, $data_tmp->toArray())) {
                $apps[$types[$t]] = [];
                continue;
            }
            $apps[$types[$t]] = $data_tmp[(string)$t];
        }


        // foreach ($types as $type) {
        //     $apps[$type] = $data_tmp[(string)$type];
        // }

        // $apps = [];

        // $keys = [
        //     'unproductive',
        //     'productive',
        //     'neutral',
        // ];
        // foreach ($keys as $key => $value) {
        //     if ($data_tmp[(string)$key] == null)
        //         $data_tmp[$key] = [];

        //     $apps[$value] = $data_tmp[(string)$key];
        // }

        if ($date->isToday())
            Redis::set('appdata:' . $userid . ':' . $date->toDateString(), json_encode($apps), 'EX', 60);
        else
            Redis::set('appdata:' . $userid . ':' . $date->toDateString(), json_encode($apps), 'EX', 600);

        return response()->json([
            'data' => $apps,
            'message' => 'Success',
            'redis' => false,
        ], 200);
    }

    public function getAppDataTest(Request $request)
    {
        $request->validate([
            'userid' => 'required|exists:accounts,id',
        ]);

        $userid = $request->userid;
        $date = Carbon::parse($request->date) ?? Carbon::now();

        $redis_apps = Redis::get('test:' . $userid . ':' . $date->toDateString());
        if ($redis_apps != "[]" && $redis_apps != null) {
            return response()->json([
                'data' => json_decode($redis_apps),
                'message' => 'Success',
                'redis' => true,
            ], 200);
        }

        $apps = RunningApps::with('category')
            ->where('date', $date->toDateString())
            ->where('userid', $userid)
            ->where('status', 'Closed')
            ->whereNot('end_time', null)
            ->get();

        $data_tmp = $apps->groupBy('category.is_productive');
        // $keys = $data_tmp->keys();

        $type_keys = [0, 1, 2];

        $types_ = [
            '0' => 'unproductive',
            '1' => 'productive',
            '2' => 'neutral',
        ];

        $types = ['unproductive', 'productive', 'neutral'];

        $apps = [];
        foreach ($type_keys as $t) {
            if (!array_key_exists($t, $data_tmp->toArray())) {
                $apps[$types[$t]] = [];
                continue;
            }
            $apps[$types[$t]] = $data_tmp[(string)$t];
        }


        // foreach ($types as $type) {
        //     $apps[$type] = $data_tmp[(string)$type];
        // }

        // $apps = [];

        // $keys = [
        //     'unproductive',
        //     'productive',
        //     'neutral',
        // ];
        // foreach ($keys as $key => $value) {
        //     if ($data_tmp[(string)$key] == null)
        //         $data_tmp[$key] = [];

        //     $apps[$value] = $data_tmp[(string)$key];
        // }

        if ($date->isToday())
            Redis::set('test:' . $userid . ':' . $date->toDateString(), json_encode($apps), 'EX', 600);
        else
            Redis::set('test:' . $userid . ':' . $date->toDateString(), json_encode($apps), 'EX', 60);

        return response()->json([
            'data' => $apps,
            'message' => 'Success',
            'redis' => false,
        ], 200);
    }
}
