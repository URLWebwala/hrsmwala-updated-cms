<?php

namespace Workdo\TimeTracker\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Workdo\TimeTracker\Models\TrackerSession;
use Workdo\TimeTracker\Models\ActivityLog;
use Workdo\TimeTracker\Models\Screenshot;
use Workdo\TimeTracker\Models\AppVersion;
use Workdo\Taskly\Models\Project;
use Workdo\Taskly\Models\ProjectTask;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Services\NotificationService;

class TrackerApiController extends Controller
{
    private function trackerSetting(string $key, $default = null)
    {
        $value = company_setting($key);
        if ($value !== null) {
            return $value;
        }

        $adminValue = admin_setting($key);
        return $adminValue !== null ? $adminValue : $default;
    }

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

    private function toTimeEntry(TrackerSession $session): array
    {
        return [
            'id' => $session->id,
            'project_id' => $session->project_id,
            'project_name' => optional($session->project)->name,
            'task_id' => $session->task_id,
            'task_name' => optional($session->task)->title,
            'activity_text' => (optional($session->task)->title ?? 'Tracking') . ' - ' . (optional($session->project)->name ?? 'Unknown Project'),
            'start_time' => optional($session->start_time)->toIso8601String(),
            'end_time' => optional($session->end_time)->toIso8601String(),
            'worked_seconds' => $this->computeWorkedSeconds($session),
            'is_running' => $session->end_time === null,
            'stop_reason' => $session->stop_reason,
            'break_seconds' => (int) ($session->total_break_seconds ?? 0),
        ];
    }

    /**
     * Get tracker settings
     */
    public function getSettings()
    {
        $keyboardEnabled = $this->trackerSetting('enable_keyboard_tracking', 'on') === 'on';
        $mouseEnabled = $this->trackerSetting('enable_mouse_tracking', 'on') === 'on';
        $heartbeatEnabled = $this->trackerSetting('enable_heartbeat_tracking', 'on') === 'on';
        $screenshotEnabled = $this->trackerSetting('enable_screenshot_tracking', 'on') === 'on';
        $keyboardTimer = (int) $this->trackerSetting('keyboard_activity_timer', 60);
        $mouseTimer = (int) $this->trackerSetting('mouse_activity_timer', 60);
        $heartbeatInterval = (int) $this->trackerSetting('heartbeat_interval', 120);
        $screenshotInterval = (int) $this->trackerSetting('screenshot_interval', 600);

        $settings = [
            'keyboard_activity_timer' => $keyboardTimer,
            'mouse_activity_timer' => $mouseTimer,
            'heartbeat_interval' => $heartbeatInterval,
            'screenshot_interval' => $screenshotInterval,
            'enable_keyboard_tracking' => $keyboardEnabled,
            'enable_mouse_tracking' => $mouseEnabled,
            'enable_heartbeat_tracking' => $heartbeatEnabled,
            'enable_screenshot_tracking' => $screenshotEnabled,
            // Backward-compatible aliases for tracker clients.
            'keyboard_enabled' => $keyboardEnabled,
            'mouse_enabled' => $mouseEnabled,
            'heartbeat_enabled' => $heartbeatEnabled,
            'screenshot_enabled' => $screenshotEnabled,
            // Additional aliases used by some desktop tracker builds.
            'keyboardIdleSeconds' => $keyboardTimer,
            'mouseIdleSeconds' => $mouseTimer,
            'heartbeat' => $heartbeatInterval,
            'heartbeatSeconds' => $heartbeatInterval,
            'screenshotEvery' => $screenshotInterval,
            'screenshotEverySeconds' => $screenshotInterval,
        ];

        return response()->json([
            'status' => 'success',
            'data' => $settings
        ]);
    }

    /**
     * Start a tracking session
     */
    public function startSession(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
            'task_id' => 'nullable|exists:project_tasks,id',
            'os_type' => 'nullable|string',
            'version' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 400);
        }

        $project = Project::find($request->project_id);
        if (!$project->tracker_enabled) {
            return response()->json(['status' => 'error', 'message' => 'Tracker is not enabled for this project'], 403);
        }

        $session = TrackerSession::create([
            'user_id' => Auth::id(),
            'project_id' => $request->project_id,
            'task_id' => $request->task_id,
            'start_time' => now(),
            'os_type' => $request->os_type,
            'version' => $request->version
        ]);

        app(NotificationService::class)->sendToRole('admin', [
            'type' => 'tracker_started',
            'title' => 'Tracker started',
            'message' => Auth::user()->name . ' started tracking session',
            'item_type' => 'tracker',
            'item_id' => $session->id,
            'meta' => ['project_id' => $session->project_id, 'task_id' => $session->task_id],
        ]);

        app(NotificationService::class)->sendToUser((int) Auth::id(), [
            'type' => 'tracker_started',
            'title' => 'Tracking started',
            'message' => 'Your tracking session has started.',
            'item_type' => 'tracker',
            'item_id' => $session->id,
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'session_id' => $session->id,
                'project_id' => $session->project_id,
                'task_id' => $session->task_id,
            ]
        ]);
    }

    /**
     * Stop a tracking session
     */
    public function stopSession(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|exists:tracker_sessions,id',
            'stop_type' => 'nullable|in:manual,idle,system',
            'stop_reason' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 400);
        }

        if (($request->stop_type ?? 'manual') === 'manual' && !$request->filled('stop_reason')) {
            return response()->json(['status' => 'error', 'message' => 'stop_reason is required for manual stop'], 422);
        }

        $session = TrackerSession::where('id', $request->session_id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$session) {
            return response()->json(['status' => 'error', 'message' => 'Session not found'], 404);
        }

        if ($session->paused_at) {
            $session->total_break_seconds = (int) ($session->total_break_seconds ?? 0) + max(0, now()->diffInSeconds($session->paused_at, false));
            $session->paused_at = null;
        }

        $session->end_time = now();
        $session->stop_type = $request->stop_type ?? 'manual';
        $session->stop_reason = $request->stop_reason;
        $session->total_duration = $this->computeWorkedSeconds($session);
        $session->save();

        app(NotificationService::class)->sendToRole('admin', [
            'type' => 'tracker_stopped',
            'title' => 'Tracker stopped',
            'message' => Auth::user()->name . ' stopped tracking session',
            'item_type' => 'tracker',
            'item_id' => $session->id,
            'meta' => [
                'worked_seconds' => (int) $session->total_duration,
                'break_seconds' => (int) ($session->total_break_seconds ?? 0),
                'stop_reason' => $session->stop_reason,
            ],
        ]);

        app(NotificationService::class)->sendToUser((int) Auth::id(), [
            'type' => 'tracker_stopped',
            'title' => 'Tracking stopped',
            'message' => 'Your tracking session has been stopped.',
            'item_type' => 'tracker',
            'item_id' => $session->id,
            'meta' => ['worked_seconds' => (int) $session->total_duration],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Session stopped successfully',
            'data' => [
                'session_id' => $session->id,
                'worked_seconds' => (int) $session->total_duration,
                'break_seconds' => (int) ($session->total_break_seconds ?? 0),
                'stop_reason' => $session->stop_reason,
            ],
        ]);
    }

    public function pauseSession(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|exists:tracker_sessions,id',
            'reason' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 400);
        }

        $session = TrackerSession::where('id', $request->session_id)->where('user_id', Auth::id())->first();
        if (!$session || $session->end_time) {
            return response()->json(['status' => 'error', 'message' => 'Session not active'], 404);
        }

        if (!$session->paused_at) {
            $session->paused_at = now();
            $session->break_count = (int) ($session->break_count ?? 0) + 1;
            if ($request->filled('reason')) {
                $session->stop_reason = $request->reason;
            }
            $session->save();

            app(NotificationService::class)->sendToRole('admin', [
                'type' => 'tracker_paused',
                'title' => 'Tracker paused',
                'message' => Auth::user()->name . ' paused tracker' . ($request->filled('reason') ? ' (' . $request->reason . ')' : ''),
                'item_type' => 'tracker',
                'item_id' => $session->id,
                'meta' => ['reason' => $request->reason],
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Session paused successfully',
            'data' => ['session_id' => $session->id, 'break_count' => (int) $session->break_count],
        ]);
    }

    public function resumeSession(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|exists:tracker_sessions,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 400);
        }

        $session = TrackerSession::where('id', $request->session_id)->where('user_id', Auth::id())->first();
        if (!$session || $session->end_time) {
            return response()->json(['status' => 'error', 'message' => 'Session not active'], 404);
        }

        if ($session->paused_at) {
            $session->total_break_seconds = (int) ($session->total_break_seconds ?? 0) + max(0, now()->diffInSeconds($session->paused_at, false));
            $session->paused_at = null;
            $session->save();

            app(NotificationService::class)->sendToRole('admin', [
                'type' => 'tracker_resumed',
                'title' => 'Tracker resumed',
                'message' => Auth::user()->name . ' resumed tracker',
                'item_type' => 'tracker',
                'item_id' => $session->id,
                'meta' => ['break_seconds' => (int) ($session->total_break_seconds ?? 0)],
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Session resumed successfully',
            'data' => ['session_id' => $session->id, 'break_seconds' => (int) ($session->total_break_seconds ?? 0)],
        ]);
    }

    /**
     * Send heartbeat (activity log)
     */
    public function heartbeat(Request $request)
    {
        if ($this->trackerSetting('enable_heartbeat_tracking', 'on') !== 'on') {
            return response()->json(['status' => 'error', 'message' => 'Heartbeat tracking is disabled'], 403);
        }

        $validator = Validator::make($request->all(), [
            'session_id' => 'required|exists:tracker_sessions,id',
            'keyboard_hits' => 'required|integer',
            'mouse_clicks' => 'required|integer',
            'activity_level' => 'required|integer|min:0|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 400);
        }

        $session = TrackerSession::where('id', $request->session_id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$session) {
            return response()->json(['status' => 'error', 'message' => 'Session not found'], 404);
        }

        $keyboardEnabled = $this->trackerSetting('enable_keyboard_tracking', 'on') === 'on';
        $mouseEnabled = $this->trackerSetting('enable_mouse_tracking', 'on') === 'on';

        ActivityLog::create([
            'session_id' => $session->id,
            'keyboard_hits' => $keyboardEnabled ? $request->keyboard_hits : 0,
            'mouse_clicks' => $mouseEnabled ? $request->mouse_clicks : 0,
            'activity_level' => $request->activity_level,
            'log_time' => now()
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Heartbeat received'
        ]);
    }

    /**
     * Upload a screenshot
     */
    public function uploadScreenshot(Request $request)
    {
        if ($this->trackerSetting('enable_screenshot_tracking', 'on') !== 'on') {
            return response()->json(['status' => 'error', 'message' => 'Screenshot tracking is disabled'], 403);
        }

        $validator = Validator::make($request->all(), [
            'session_id' => 'required|exists:tracker_sessions,id',
            'screenshot' => 'required|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 400);
        }

        $session = TrackerSession::where('id', $request->session_id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$session) {
            return response()->json(['status' => 'error', 'message' => 'Session not found'], 404);
        }

        // Housekeeping: remove screenshots older than 7 days from DB + storage.
        $expiredScreenshots = Screenshot::where('captured_at', '<', now()->subDays(7))->get();
        foreach ($expiredScreenshots as $expiredScreenshot) {
            if (!empty($expiredScreenshot->file_path) && Storage::disk('public')->exists($expiredScreenshot->file_path)) {
                Storage::disk('public')->delete($expiredScreenshot->file_path);
            }
            $expiredScreenshot->delete();
        }

        $screenshotInterval = (int) $this->trackerSetting('screenshot_interval', 600);
        $lastScreenshot = Screenshot::where('session_id', $session->id)->latest('id')->first();
        if ($lastScreenshot) {
            // Use DB clock for diff to avoid PHP/DB timezone parsing mismatch.
            $elapsed = (int) (DB::table('screenshots')
                ->where('id', $lastScreenshot->id)
                ->selectRaw('GREATEST(0, TIMESTAMPDIFF(SECOND, COALESCE(captured_at, created_at), NOW())) as elapsed_seconds')
                ->value('elapsed_seconds') ?? 0);
        } else {
            $elapsed = $screenshotInterval;
        }

        if ($lastScreenshot && $elapsed < $screenshotInterval) {
            return response()->json([
                'status' => 'success',
                'message' => 'Screenshot skipped: interval not elapsed yet',
                'data' => [
                    'uploaded' => false,
                    'next_capture_in_seconds' => max(0, $screenshotInterval - $elapsed),
                    'configured_interval_seconds' => $screenshotInterval,
                    'elapsed_seconds' => $elapsed,
                ],
            ]);
        }

        if ($request->hasFile('screenshot')) {
            $path = $request->file('screenshot')->store('screenshots/' . Auth::id(), 'public');
            
            Screenshot::create([
                'session_id' => $session->id,
                'file_path' => $path,
                'captured_at' => now()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Screenshot uploaded successfully',
                'data' => [
                    'uploaded' => true,
                    'file_path' => $path,
                ],
            ]);
        }

        return response()->json(['status' => 'error', 'message' => 'Failed to upload screenshot'], 500);
    }

    /**
     * Get summary for employee dashboard
     */
    public function getMySummary(Request $request)
    {
        $targetDate = $request->query('date');
        if ($targetDate) {
            try {
                $day = Carbon::parse($targetDate)->startOfDay();
            } catch (\Exception $e) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid date format'
                ], 422);
            }
        } else {
            $day = Carbon::today();
        }

        $sessions = TrackerSession::where('user_id', Auth::id())
            ->whereDate('start_time', $day)
            ->get();

        $totalWorkedSeconds = $sessions->sum(function ($session) {
            return $this->computeWorkedSeconds($session);
        });
        $totalBreakSeconds = (int) $sessions->sum('total_break_seconds');
        $activeSessions = $day->isToday()
            ? TrackerSession::where('user_id', Auth::id())->whereNull('end_time')->count()
            : 0;

        return response()->json([
            'status' => 'success',
            'data' => [
                'date' => $day->format('Y-m-d'),
                'daily_working_hours' => round($totalWorkedSeconds / 3600, 2),
                'total_worked_seconds' => (int) $totalWorkedSeconds,
                'total_break_seconds' => $totalBreakSeconds,
                'active_sessions' => $activeSessions,
                'total_sessions_today' => $sessions->count()
            ]
        ]);
    }

    public function getMySummaryWeek(Request $request)
    {
        $endDate = $request->query('end_date', now()->toDateString());
        $end = Carbon::parse($endDate)->endOfDay();
        $start = $end->copy()->subDays(6)->startOfDay();

        $sessions = TrackerSession::where('user_id', Auth::id())
            ->whereBetween('start_time', [$start, $end])
            ->get();

        $weekWorked = (int) $sessions->sum(function ($session) {
            return $this->computeWorkedSeconds($session);
        });
        $weekBreak = (int) $sessions->sum('total_break_seconds');

        $days = [];
        for ($i = 0; $i < 7; $i++) {
            $date = $start->copy()->addDays($i);
            $daySessions = $sessions->filter(fn ($s) => optional($s->start_time)->toDateString() === $date->toDateString());
            $days[] = [
                'date' => $date->toDateString(),
                'worked_seconds' => (int) $daySessions->sum(fn ($s) => $this->computeWorkedSeconds($s)),
                'break_seconds' => (int) $daySessions->sum('total_break_seconds'),
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'week_total_worked_seconds' => $weekWorked,
                'week_total_break_seconds' => $weekBreak,
                'days' => $days,
            ],
        ]);
    }

    /**
     * Get time entries for employee dashboard
     */
    public function getMyTimeEntries(Request $request)
    {
        $sessions = TrackerSession::where('user_id', Auth::id())
            ->with(['project:id,name', 'task:id,title'])
            ->when($request->query('date'), function ($q, $date) {
                $q->whereDate('start_time', $date);
            })
            ->latest()
            ->paginate((int) $request->query('limit', 15));

        $items = collect($sessions->items())->map(fn ($session) => $this->toTimeEntry($session))->values();

        return response()->json([
            'status' => 'success',
            'data' => $items,
            'pagination' => [
                'current_page' => $sessions->currentPage(),
                'last_page' => $sessions->lastPage(),
                'per_page' => $sessions->perPage(),
                'total' => $sessions->total(),
            ],
        ]);
    }

    public function getMyRecentTasks(Request $request)
    {
        $limit = (int) $request->query('limit', 3);
        $limit = $limit > 0 ? min($limit, 20) : 3;

        $sessions = TrackerSession::where('user_id', Auth::id())
            ->whereNotNull('task_id')
            ->with(['task:id,title', 'project:id,name'])
            ->latest('start_time')
            ->get()
            ->groupBy('task_id')
            ->map(fn ($group) => $group->first())
            ->take($limit)
            ->values();

        $data = $sessions->map(function ($session) {
            return [
                'task_id' => $session->task_id,
                'task_name' => optional($session->task)->title,
                'project_name' => optional($session->project)->name,
                'last_worked_at' => optional($session->start_time)->toIso8601String(),
                'last_worked_seconds' => $this->computeWorkedSeconds($session),
                'last_stop_reason' => $session->stop_reason,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * Get screenshots for employee dashboard
     */
    public function getMyScreenshots()
    {
        $screenshots = Screenshot::whereHas('session', function($q) {
                $q->where('user_id', Auth::id());
            })
            ->latest()
            ->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => $screenshots
        ]);
    }
}
