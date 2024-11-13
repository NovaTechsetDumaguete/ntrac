<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sessions extends Model
{
    use HasFactory;

    protected $table = 'running_apps';

    protected $fillable = [
        'id',
        'task_name',
        'category_id',
        'taskid',
        'userid',
        'time',
        'date',
    ];
}
