<?php

namespace Workdo\TimeTracker\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use Workdo\Taskly\Models\Project;
use Workdo\Taskly\Models\ProjectTask;

class TrackerSession extends Model
{
    protected $table = 'tracker_sessions';

    protected $fillable = [
        'user_id',
        'project_id',
        'task_id',
        'start_time',
        'end_time',
        'total_duration',
        'total_break_seconds',
        'break_count',
        'paused_at',
        'stop_reason',
        'stop_type',
        'os_type',
        'version'
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'paused_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function task()
    {
        return $this->belongsTo(ProjectTask::class, 'task_id');
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class, 'session_id');
    }

    public function screenshots()
    {
        return $this->hasMany(Screenshot::class, 'session_id');
    }
}
