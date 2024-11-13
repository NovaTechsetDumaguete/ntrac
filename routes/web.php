<?php
// ini_set('max_execution_time', 0);
// ini_set('memory_limit', '11256M');

use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use Illuminate\Support\Facades\Route;

use App\Models\TrackRecords;
use App\Models\ExportHistory;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    //return view('welcome');
    #$apps = Employee::where('id', 13)->paginate(1);
    #$apps = Employee::all();
    $apps = Employee::with('runningapps')->paginate(1);
    return EmployeeResource::collection($apps);
});
