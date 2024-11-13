<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

use Carbon\Carbon;

class Employee extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'accounts';

    protected $fillable = [
        'id',
        'employee_id',
        'user_image',
        'first_name',
        'last_name',
        'position',
        'team_id',
        'department',
        'username',
        'email',
        'type',
        'status',
        'active_status',
        'site',
        'password',
        'position_id',
        'version',
        'updator_version',
    ];

    protected $hidden = [
        'password',
    ];

    public function timeLogs()
    {
        return $this->hasMany(TimeLogs::class, 'emp_id');
    }

    public function anomalies()
    {
        return $this->hasMany(TrackRecords::class, 'userid');
    }

    public function runningapps()
    {
        return $this->hasMany(RunningApps::class, 'userid')
            ->where('date', '>=', Carbon::now()->startOfDay())
            ->where('date', '<=', Carbon::now());
    }

    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function position()
    {
        return $this->belongsTo(Position::class, 'position_id');
    }

    public function team()
    {
        return $this->belongsTo(Team::class, 'team_id');
    }
}
