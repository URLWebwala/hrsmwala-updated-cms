<?php

namespace Workdo\TimeTracker\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $table = 'activity_logs';

    protected $fillable = [
        'session_id',
        'keyboard_hits',
        'mouse_clicks',
        'activity_level',
        'log_time'
    ];

    protected $casts = [
        'log_time' => 'datetime',
    ];

    public function session()
    {
        return $this->belongsTo(TrackerSession::class, 'session_id');
    }
}
