<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccessRole extends Model
{
    use HasFactory;

    protected $table = 'access_roles';

    protected $fillable = [
        'id',
        'userid',
        'role',
        'description',
    ];

    public function manager()
    {
        return $this->belongsTo(User::class, 'userid');
    }
}
