<?php

namespace Workdo\TimeTracker\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Workdo\TimeTracker\Models\TrackerSession;
use Workdo\TimeTracker\Models\Screenshot;
use Workdo\TimeTracker\Models\ActivityLog;
use Inertia\Inertia;
use App\Models\User;
use Carbon\Carbon;

class AdminTrackerController extends Controller
{
    private function computeWorkedSeconds(TrackerSession $session): int
    {
        $end = $session->end_time ?? now();
        $gross = max(0, $end->diffInSeconds($session->start_time, false));
        $breakSeconds = (int) ($session->total_break_seconds ?? 0);

        if ($session->paused_at && !$session->end_time) {
            $breakSeconds += max(0, now()->diffInSeconds($session->paused_at, false));
        }

        return max(0, $gross - $breakSeconds);
    }

    /**
     * Admin view of all employee tracking summaries
     */
    public function summary(Request $request)
    {
        if (Auth::user()->can('manage-timetracker')) {
            $date = $request->date ? Carbon::parse($request->date) : Carbon::today();
            
            // Get all employees created by this company
            $employees = User::where('created_by', creatorId())
                ->where('type', '!=', 'company')
                ->get();

            $summaryData = [];
            foreach ($employees as $employee) {
                $sessions = TrackerSession::where('user_id', $employee->id)
                    ->with(['project:id,name', 'task:id,title'])
                    ->whereDate('start_time', $date)
                    ->get();

                $workedSeconds = (int) $sessions->sum(function ($session) {
                    return $this->computeWorkedSeconds($session);
                });
                $breakSeconds = (int) $sessions->sum(function ($session) {
                    $totalBreak = (int) ($session->total_break_seconds ?? 0);
                    if ($session->paused_at && !$session->end_time) {
                        $totalBreak += max(0, now()->diffInSeconds($session->paused_at, false));
                    }
                    return $totalBreak;
                });
                $avgActivity = ActivityLog::whereIn('session_id', $sessions->pluck('id'))
                    ->avg('activity_level') ?? 0;
                $recentTasks = $sessions
                    ->filter(fn ($session) => !empty(optional($session->task)->title))
                    ->sortByDesc('start_time')
                    ->pluck('task.title')
                    ->unique()
                    ->take(3)
                    ->values()
                    ->all();

                $summaryData[] = [
                    'user_id' => $employee->id,
                    'name' => $employee->name,
                    'avatar' => $employee->avatar,
                    'worked_seconds' => $workedSeconds,
                    'break_seconds' => $breakSeconds,
                    'total_hours' => round($workedSeconds / 3600, 2),
                    'avg_activity' => round($avgActivity, 1),
                    'session_count' => $sessions->count(),
                    'recent_tasks' => $recentTasks,
                ];
            }

            return Inertia::render('TimeTracker/Admin/Summary', [
                'summaryData' => $summaryData,
                'selectedDate' => $date->toDateString(),
            ]);
        } else {
            return redirect()->back()->with('error', __('Permission denied'));
        }
    }

    /**
     * Admin view of all screenshots
     */
    public function screenshots(Request $request)
    {
        if (Auth::user()->can('manage-timetracker')) {
            $screenshots = Screenshot::with(['session.user', 'session.project', 'session.task'])
                ->whereHas('session', function($q) {
                    $q->whereHas('user', function($uq) {
                        $uq->where('created_by', creatorId());
                    });
                })
                ->when($request->user_id, function($q) use ($request) {
                    $q->whereHas('session', function($sq) use ($request) {
                        $sq->where('user_id', $request->user_id);
                    });
                })
                ->latest()
                ->paginate(24);

            $screenshots->getCollection()->transform(function ($screenshot) {
                $screenshot->screenshot_url = url('/storage/' . ltrim($screenshot->file_path, '/'));
                if ($screenshot->session) {
                    $screenshot->session->worked_seconds = $this->computeWorkedSeconds($screenshot->session);
                    $screenshot->session->break_seconds = (int) ($screenshot->session->total_break_seconds ?? 0);
                }
                return $screenshot;
            });

            $employees = User::where('created_by', creatorId())
                ->where('type', '!=', 'company')
                ->get();

            return Inertia::render('TimeTracker/Admin/Screenshots', [
                'screenshots' => $screenshots,
                'employees' => $employees,
            ]);
        } else {
            return redirect()->back()->with('error', __('Permission denied'));
        }
    }
}
