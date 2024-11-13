<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ManagerTeam extends Model
{
    use HasFactory;

    protected $table = 'manager_team_access';

    protected $fillable = [
        'id',
        'team_id',
        'manager_id',
    ];
}
