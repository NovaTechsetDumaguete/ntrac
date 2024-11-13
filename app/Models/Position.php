<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    use HasFactory;

    protected $table = 'tblemp_positions';

    protected $fillable = [
        'id',
        'position',
        'description',
        'department',
        'manager_id',
        'team_id',
        'active',
    ];

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id', 'id');
    }

    public function employees()
    {
        return $this->hasMany(Employee::class, 'position_id', 'id');
    }
}
