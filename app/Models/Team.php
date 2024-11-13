<?php

namespace App\Models;

use Illuminate\Database\Capsule\Manager;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;

    protected $table = 'teams';

    protected $fillable = [
        'id',
        'name',
        'description',
        'manager_id',
        'member_count',
    ];

    public function team()
    {
        return $this->belongsTo(Manager::class, 'id');
    }
}
