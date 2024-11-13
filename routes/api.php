<?php

use App\Http\Controllers\Api\ActivityTrackController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AppCategoriesController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\RunningAppsController;
use App\Http\Controllers\Api\TimeLogsController;
use App\Http\Controllers\Api\ReportController;
use App\Models\ExportHistory;
use App\Models\TrackRecords;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\DB;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('/users', UserController::class);

    Route::get('/download/{filename}', [UserController::class, 'downloadFile']);
    // Route::apiResource('/categories', AppCategoriesController::class);
    Route::apiResource('/runningapps', RunningAppsController::class);
    Route::apiResource('/employees', EmployeeController::class);
    Route::apiResource('/timelogs', TimeLogsController::class);

    Route::get('/employee/{id}', [EmployeeController::class, 'getEmployeeById']);
    Route::get('/teams', [EmployeeController::class, 'getTeams']);
    Route::get('/accounts', [EmployeeController::class, 'getAccounts']);

    // Categories
    Route::get('/categories', [AppCategoriesController::class, 'index']);
    Route::get('/categories/{id}', [AppCategoriesController::class, 'show']);
    Route::post('/categories', [AppCategoriesController::class, 'store']);
    Route::put('/categories/{id}', [AppCategoriesController::class, 'update']);
    Route::delete('/categories/{id}', [AppCategoriesController::class, 'destroy']);

    // Settings
    Route::post('/reset-password', [UserController::class, 'resetPassword']);

    // Dashboard
    Route::post('/dashboard/apps', [EmployeeController::class, 'getAllDailyOpenedApps']);
    Route::post('/dashboard/categoryapps', [EmployeeController::class, 'getAllDailyOpenedByCategory']);
    Route::get('/dashboard/workhrs/{date?}/{teamid?}', [EmployeeController::class, 'getWorkHrs']);

    // Productivity Dashboard
    Route::get('/productivity/team/{team_id}/{date?}', [ActivityTrackController::class, 'getTeamProductivityData']);
    Route::get('/productivity/duration', [ActivityTrackController::class, 'getNeutralProductiveDuration']);

    // Employees
    Route::get('/employees/absent', [EmployeeController::class, 'absent']);
    Route::get('/employees/getbyTeamID/{team_id}', [EmployeeController::class, 'getEmployeeByTeamID']);
    Route::get('/employees/anomaly', [EmployeeController::class, 'anomaly']);
    Route::get('/employees/runningapps', [EmployeeController::class, 'runningapps']);
    Route::post('/employees/apps', [EmployeeController::class, 'getEmployeeApps']);
    Route::post('/employees/productivity', [EmployeeController::class, 'getProductivity']);
    Route::get('/employees/team/{team}', [EmployeeController::class, 'getEmployeesByTeam']);
    Route::get('/employees/team/status/{team?}', [EmployeeController::class, 'getEmployeesStatus']);

    // Activity Tracking
    Route::get('/activity/employee/{userid}/{date?}', [ActivityTrackController::class, 'getEmployeeActivity']);
    Route::get('/activity/time-log/{userid}/{date?}', [EmployeeController::class, 'getTimeLogByEmployee']);

    // Reports & Analytics //* 2
    Route::get('/reports/attendance/{from}/{to?}', [EmployeeController::class, 'getAttendanceReport']);
    Route::get('/reports/tracking/{from}/{to?}', [EmployeeController::class, 'getTrackingReport']);
    Route::get('/reports/applications/{from}/{to?}', [EmployeeController::class, 'getApplicationReport']);
    Route::get('/reports/bugs', [ReportController::class, 'getBugReports']);
    Route::put('/reports/bugs', [ReportController::class, 'insertBugReports']);
    Route::get('/reports/anomalies', [ReportController::class, 'getAnomalyReport']);
    Route::get('/reports/history', [ReportController::class, 'getReportHistoryByManager']);
    Route::post('/report/update-history', [ReportController::class, 'updateReportHistory']);

    Route::get('/reports/download', [ReportController::class, 'downloadReports']);

    // UserApproval
    Route::get('/userapproval', [EmployeeController::class, 'getUserForApproval']);
    Route::post('/user-approval/update', [EmployeeController::class, 'updateUserForApproval']);

    // Attendance
    Route::get('/attendance/weekly/{date?}/{teamid?}', [EmployeeController::class, 'getWeeklyAttendance']);

    // Utilization
    Route::get('/utilization/weekly/{date?}/{teamid?}', [EmployeeController::class, 'getWeeklyUtilization']);


    // NEW API HERE
    Route::put('/record', [RunningAppsController::class, 'recordLog'])->name('record');
    Route::patch('/record', [RunningAppsController::class, 'updateLog'])->name('record-update');
    Route::get('/apps/neutral', [RunningAppsController::class, 'getNeutralApps']);
    Route::get('/duplicates', [RunningAppsController::class, 'getAllDubplicates']);
    Route::get('/recordChecking', [RunningAppsController::class, 'checkRecord']);

    Route::put('/record/vdi', [RunningAppsController::class, 'recordVDILog']);

    // TEST API
    Route::put('/record-test', [RunningAppsController::class, 'recordLogTest']);
    Route::get('/testtracking/data/{empid}/{date?}', [TimeLogsController::class, 'testGraphData']);

    Route::get('/employee/info/{empid}', [EmployeeController::class, 'getInfoByEmployeeId']);
    Route::get('/employee/infoV/{empid}/{version}', [EmployeeController::class, 'getInfoByEmployeeIdV']);
    Route::get('/employee/infoVV/{empid}/{version}/{updator_version}', [EmployeeController::class, 'getInfoByEmployeeIdVV']);
    Route::get('/employee/infoVVV', [EmployeeController::class, 'getInfoByEmployeeIdVVV']);
    Route::get('/employee/infowV/{empid}', [EmployeeController::class, 'getInfoByEmployeeIdWV']);
    Route::get('/employee/infowithimg/{empid}', [EmployeeController::class, 'getInfoByEmployeeIdwithImage']);
    Route::put('/employee/updateUserImage', [EmployeeController::class, 'updateuserImages']);
    Route::get('/employee/log/{empid}/{date}', [EmployeeController::class, 'getEmployeeActivity']);
    Route::get('/employee/status/{empid}', [ActivityTrackController::class, 'getActiveStatus']);
    Route::patch('/employee/status', [ActivityTrackController::class, 'updateActiveStatus']);

    // Tracking
    Route::get('/tracking/data/{empid}/{date?}', [TimeLogsController::class, 'graphData']);
    Route::get('/redis/tracking/data/{empid}/{date}', [TimeLogsController::class, 'redisGraphData']);
    Route::get('/tracking/apps/data', [TimeLogsController::class, 'getAppData']);
    Route::get('/test-tracking/apps/data', [TimeLogsController::class, 'getAppDataTest']);
    Route::get('/tracking/employee', [ActivityTrackController::class, 'getActivityByEmployee']);
    Route::get('/tracking/recent', [EmployeeController::class, 'recentLogs']);

    Route::get('/employees-all', [EmployeeController::class, 'getAllEmployees']);

    Route::put('/insertRequest', [EmployeeController::class, 'insertRequestApproval']);
    Route::get('/viewRequestApproval', [EmployeeController::class, 'getAllRequest']);
    Route::get('/viewRequest', [EmployeeController::class, 'getRequestbyid']);
    Route::get('/viewRequestApprovalWManager', [EmployeeController::class, 'getAllRequestWManager']);
    Route::put('/insertRequesttest', [EmployeeController::class, 'insertRequestApprovaltest']);
    Route::post('/approvedRequestApproval', [EmployeeController::class, 'updateTransactionStatus']);
    Route::post('/updateRequest', [EmployeeController::class, 'updateUserForApprovalbyId']);
    Route::delete('/deleteUserData', [RunningAppsController::class, 'deleteUserData']);

    Route::get('/reverb', [AuthController::class, 'testReverb']);
});

Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);

// employee registration
Route::post('/register', [AuthController::class, 'register']);
Route::post('/registerwithimg', [AuthController::class, 'registertestingwithimage']);
Route::post('/app-login', [AuthController::class, 'appLogin']);

Route::get('/positions', [EmployeeController::class, 'getPositions']);


Route::get('/employees/image/{id}', [EmployeeController::class, 'getImageById']);
Route::get('/forcelogout/{id}', [AuthController::class, 'forceLogout']);
Route::get('/minimum/speed', [RunningAppsController::class, 'getMinSpeed']);
Route::get('/minimum/settings', [RunningAppsController::class, 'getSettings']);

Route::get('/latest', function () {
    $type  = request('type') ?? 'application';
    // $latest = Redis::get('latest:version');
    // $redis = true;

    // if ($latest == null) {
    //     $latest = DB::table('tblappversion')->orderBy('id', 'desc')->first();
    //     Redis::set('latest:version', json_encode($latest), 'EX', 86400 / 2);
    //     $redis = false;
    // }

    $table = $type == 'updator' ? 'tblAppUpdatorVersion' : 'tblappversion';
    $latest = DB::table($table)->orderBy('id', 'desc')->first();

    return response()->json([
        'data' => $latest,
        'message' => 'Success',
        'type' => $type,
    ], 200);
});

Route::get('/versions', function () {
    $versions = DB::table('tblappversion')->orderBy('id', 'desc')->get();
    return response()->json([
        'data' => $versions,
        'message' => 'Success'
    ], 200);
});
