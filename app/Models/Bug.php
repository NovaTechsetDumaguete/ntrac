<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bug extends Model
{
    use HasFactory;

    protected $table = 'bugsreports';

    protected $fillable = [
        'id',
        'userid',
        'description',
        'date_report',
        'time_report',
        'status',
        'completed_at',
        'created_at',
        'updated_at',
    ];
}
