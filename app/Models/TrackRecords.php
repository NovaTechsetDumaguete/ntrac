<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrackRecords extends Model
{
    use HasFactory;

    protected $table = 'tbltrackrecords';

    protected $fillable = [
        'id',
        'userid',
        'timein',
        'datein',
        'timebreakin',
        'datebreakin',
        'timebreakout',
        'datebreakout',
        'timeout',
        'dateout',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'userid', 'id');
    }

    public function tasks()
    {
        return $this->hasMany(RunningApps::class, 'taskid', 'id');
    }
}
