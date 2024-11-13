<?php

namespace App\Http\Controllers\Api;

use App\Events\ReportExported;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\SignupRequest;

use App\Http\Requests\EmployeeLoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\AppCategories;
use App\Models\Employee;
use App\Models\ExportHistory;
use App\Models\Position;
use App\Models\Team;
use App\Models\TrackRecords;
use App\Models\User;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function signup(SignupRequest $request)
    {
        $data = $request->validated();
        /** @var \App\Models\User $user */
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
        ]);

        $token = $user->createToken('main')->plainTextToken;
        return response(compact('user', 'token'));
    }

    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();
        if (!Auth::attempt($credentials)) {
            return response([
                'message' => 'Provided email or password is incorrect'
            ], 422);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $access = DB::table('manager_team_access')->where('manager_id', $user->id)->get();
        $teams = $access->map(function ($item) {
            return Team::find($item->team_id);
        });

        $token = $user->createToken('main')->plainTextToken;
        return response(compact('user', 'token', 'teams'));
    }

    public function appLogin(EmployeeLoginRequest $request)
    {
        // $credentials = $request->validated();
        if (!Auth::guard('ntrac')->attempt([
            'email' => $request->email,
            'password' => $request->password
        ])) {
            return response([
                'message' => 'Provided email or password is incorrect'
            ], 422);
        }

        /** @var \App\Models\Employee $user */
        $user = Auth::guard('ntrac')->user();
        $token = $user->createToken('employee')->plainTextToken;
        return response(compact('user', 'token'));
    }

    public function register(RegisterRequest $request)
    {
        $data = $request->validated();
        $position = Position::find($data['position_id']);
        $password = $request->password ?? '123456';

        $user = Employee::create([
            'employee_id' => $data['employee_id'],
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'position_id' => $data['position_id'],
            'position' => json_encode([$position->position, $position->id]),
            'username' => $request->username ?? $data['employee_id'],
            'type' => 'User',
            'status' => 'Pending',
            'department' => $position->department,
            'phone_no' => $request->phone_no,
            'incremented' => 0,
            'active_status' => 'Offline',
            'password' => bcrypt($password),
            'site' => $request->site ?? 'Dumaguete',
        ]);

        $token = $user->createToken('employee')->plainTextToken;
        return response(compact('user', 'token'));
    }
    public function registertestingwithimage(RegisterRequest $request)
    {

        $data = $request->validated();
        $position = Position::find($data['position_id']);
        $password = $request->password ?? '123456';

        $employee = Employee::where('email', $data['email'])->first();
        if ($employee) {
            return response()->json([
                'message' => 'Email already exists',
            ], 409); // Use 409 Conflict status code
        }


        $employee = Employee::where('employee_id', $data['employee_id'])->first();
        if ($employee) {
            return response()->json([
                'message' => 'User already exists',
            ], 409); // Use 409 Conflict status code
        }

        $getteam_id = Position::where('id', $data['position_id'])->first();

        $user = Employee::create([
            'employee_id' => $data['employee_id'],
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'position_id' => $data['position_id'],
            'team_id' => $getteam_id->team_id,
            'position' => json_encode([$position->position, $position->id]),
            'username' => $request->username ?? $data['employee_id'],
            'type' => 'User',
            'status' => 'Pending',
            'department' => $position->department,
            'phone_no' => $request->phone_no,
            'incremented' => 0,
            'active_status' => 'Offline',
            'password' => bcrypt($password),
            'site' => $request->site,
            'user_image' => $request->user_image, // Save the image path to the database
        ]);

        $token = $user->createToken('employee')->plainTextToken;
        return response(compact('user', 'token'));
    }

    public function logout(Request $request)
    {
        /** @var \App\Models\User $user */
        //$user = $request->user();
        //$user->currentAccessToken()->delete();

        $request->user()->currentAccessToken()->delete();
        //return response('', 204);

        //$user = request()->user();
        //$user->tokens()->where('id', $user->currentAccessToken()->id)->delete();

        //dd(Auth::user());
        return response()->json(['message' => 'Logout Success!'], 200);
    }

    public function forceLogout($id)
    {
        $employee = Employee::find($id);
        $employee->incremented = 0;
        $employee->active_status = 'Offline';
        $employee->save();

        return response()->json([
            'message' => 'Logout Success!'
        ], 200);
    }

    public function testReverb()
    {
        // $user = Auth::user();
        $report = ExportHistory::find(1);
        $items = TrackRecords::with('employee')
            ->where('userid', $report->employee_id)
            ->whereBetween('datein', [$report->start_date, $report->end_date])
            ->get();

        $cat_prod = AppCategories::select('id')->where('is_productive', 1)->get();
        $cat_unprod = AppCategories::select('id')->where('is_productive', 0)->get();
        $cat_neu = AppCategories::select('id')->where('is_productive', 2)->get();

        $productive = $items[0]->tasks->whereIn('category_id', $cat_prod->pluck('id'))->sum('duration');

        // $productive = $items[0]->tasks->whereIn('category_id', [6])->sum('duration');
        // dd($productive);
        return response()->json([
            'data' => $productive,
        ]);

        // return response()->json([
        //     'userId' => $user->id,
        //     'status' => 'OK',
        //     // 'event' => $event,
        // ], 200);
    }
}
