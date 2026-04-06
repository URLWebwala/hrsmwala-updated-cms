<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoundSetting extends Model
{
    protected $fillable = [
        'type',
        'file_path',
        'is_active',
        'volume',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'volume' => 'float',
    ];
}

