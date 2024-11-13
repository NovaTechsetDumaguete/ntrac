<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExportHistory extends Model
{
    use HasFactory;

    protected $table = 'export_history';

    protected $fillable = [
        'id',
        'type',
        'userid',
        'filename',
        'employee_id',
        'item_count',
        'start_date',
        'end_date',
        'status',
        'employees',
        'team_name',
    ];
}
