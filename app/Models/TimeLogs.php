<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TimeLogs extends Model
{
    use HasFactory;

    protected $table = 'tbltime_logs';

    protected $fillable = [
        'id',
        'emp_id',
        'session_id',
        'action',
    ];
}
