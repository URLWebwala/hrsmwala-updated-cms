<?php

namespace Workdo\TimeTracker\Models;

use Illuminate\Database\Eloquent\Model;

class Screenshot extends Model
{
    protected $table = 'screenshots';

    protected $fillable = [
        'session_id',
        'file_path',
        'captured_at'
    ];

    protected $casts = [
        'captured_at' => 'datetime',
    ];

    public function session()
    {
        return $this->belongsTo(TrackerSession::class, 'session_id');
    }
}
