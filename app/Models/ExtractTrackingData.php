<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExtractTrackingData extends Model
{
    use HasFactory;

    protected $table = 'extract_tracking_data';

    protected $fillable = [
        'id',
        'user_id',
        'employee_id',
        'report_id',
        'productive_duration',
        'unproductive_duration',
        'neutral_duration',
        'description',
        'duration',
        'date',
        'time_in',
        'time_out',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function export_history()
    {
        return $this->belongsTo(ExportHistory::class, 'report_id');
    }
}
