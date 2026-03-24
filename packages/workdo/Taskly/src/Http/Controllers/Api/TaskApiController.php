<?php

namespace Workdo\Taskly\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Workdo\Taskly\Models\ProjectTask;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Workdo\Taskly\Models\TaskStage;
use Workdo\Taskly\Models\ActivityLog;
use Workdo\Taskly\Models\TaskComment;
use Workdo\Taskly\Models\TaskSubtask;
use Workdo\Taskly\Events\UpdateProjectTaskStage;
use Workdo\Taskly\Models\Project;
use Workdo\Taskly\Models\ProjectBug;
use Workdo\Taskly\Models\BugStage;
use App\Services\NotificationService;

class TaskApiController extends Controller
{
    use ApiResponseTrait;

    private function parseAssignedUserIds($assignedTo): array
    {
        if (empty($assignedTo)) {
            return [];
        }

        if (is_array($assignedTo)) {
            return array_map('strval', $assignedTo);
        }

        $decoded = json_decode($assignedTo, true);
        if (is_array($decoded)) {
            return array_map('strval', $decoded);
        }

        return array_map('trim', explode(',', (string) $assignedTo));
    }

    private function statusFromStage(?string $stageName, bool $isComplete): string
    {
        if ($isComplete) {
            return 'completed';
        }

        $name = strtolower($stageName ?? '');
        if (str_contains($name, 'progress') || str_contains($name, 'review')) {
            return 'in_progress';
        }

        return 'pending';
    }

    private function resolveTaskStageIdFromStatus(string $status): ?int
    {
        $query = TaskStage::where('created_by', creatorId());
        $status = strtolower($status);

        if (in_array($status, ['done', 'completed', 'complete'])) {
            return optional((clone $query)->where('complete', true)->orderBy('order')->first())->id;
        }

        if (in_array($status, ['in_progress', 'progress'])) {
            return optional((clone $query)
                ->where('complete', false)
                ->whereRaw('LOWER(name) like ?', ['%progress%'])
                ->orderBy('order')
                ->first())->id
                ?? optional((clone $query)->where('complete', false)->orderBy('order')->skip(1)->first())->id;
        }

        return optional((clone $query)->where('complete', false)->orderBy('order')->first())->id;
    }

    private function resolveBugStageIdFromStatus(string $status): ?int
    {
        $query = BugStage::where('created_by', creatorId());
        $status = strtolower($status);

        if (in_array($status, ['done', 'completed', 'resolved', 'solved'])) {
            return optional((clone $query)->where('complete', true)->orderBy('order')->first())->id;
        }

        if (in_array($status, ['in_progress', 'progress'])) {
            return optional((clone $query)
                ->where('complete', false)
                ->whereRaw('LOWER(name) like ?', ['%progress%'])
                ->orderBy('order')
                ->first())->id
                ?? optional((clone $query)->where('complete', false)->orderBy('order')->skip(1)->first())->id;
        }

        return optional((clone $query)->where('complete', false)->orderBy('order')->first())->id;
    }

    public function index(Request $request)
    {
        try {
            if (Auth::user()->can('manage-project-task')) {
                $items = ProjectTask::select('project_tasks.id', 'project_id', 'milestone_id', 'title', 'priority', 'assigned_to', 'duration', 'description', 'stage_id', 'created_at')
                    ->with(['project:id,name', 'milestone:id,title', 'assignedUser:id,name,avatar'])
                    ->where(function ($q) {
                        if (Auth::user()->can('manage-any-project-task')) {
                            $q->where('created_by', creatorId());
                        } else if (Auth::user()->type == 'client') {
                            $clientProjectIds = Project::where('created_by', Auth::user()->created_by)
                                ->whereHas('clients', function ($query) {
                                    $query->where('client_id', Auth::id());
                                })
                                ->pluck('id');
                            $q->whereIn('project_id', $clientProjectIds);
                        } else if (Auth::user()->can('manage-own-project-task')) {
                            $q->where(function ($subQ) {
                                $subQ->where('creator_id', Auth::id())
                                    ->orWhereJsonContains('assigned_to', (string)Auth::id());
                            });
                        } else {
                            $q->whereRaw('1 = 0');
                        }
                    })
                    ->when($request->project_id, fn($q) => $q->where('project_id', $request->project_id))
                    ->when($request->status && in_array($request->status, ['High', 'Medium', 'Low']), fn($q) => $q->where('priority', $request->status))
                    ->when($request->sort, fn($q) => $q->orderBy($request->sort, $request->get('direction', 'asc')), fn($q) => $q->latest());

                $items = $items->get();
                $items->transform(function ($task) {
                      // Parse duration
                    if ($task->duration && strpos($task->duration, ' - ') !== false) {
                        $dateRange        = explode(' - ', $task->duration);
                        $task->start_date = trim($dateRange[0]);
                        $task->end_date   = trim($dateRange[1]);
                    } else {
                        $task->start_date = null;
                        $task->end_date   = null;
                    }

                      // Get assigned users
                    $assignedUsers = [];
                    if ($task->assigned_to) {
                        $userIds       = is_array($task->assigned_to) ? $task->assigned_to : json_decode($task->assigned_to, true);
                        $assignedUsers = User::whereIn('id', $userIds)
                            ->select('id', 'name', 'email', 'avatar')
                            ->get()
                            ->map(function ($user) {
                                return [
                                    'id'     => $user->id,
                                    'name'   => $user->name,
                                    'email'  => $user->email,
                                    'avatar' => $user->avatar ? getImageUrlPrefix() . '/' . $user->avatar : getImageUrlPrefix() . '/avatar.png',
                                ];
                            });
                    }

                    return [
                        'id'             => $task->id,
                        'title'          => $task->title,
                        'description'    => $task->description,
                        'priority'       => $task->priority,
                        'start_date'     => $task->start_date,
                        'end_date'       => $task->end_date,
                        'stage_id'       => $task->stage_id,
                        'project_id'     => $task->project_id,
                        'milestone_id'   => $task->milestone_id,
                        'project'        => $task->project,
                        'milestone'      => $task->milestone,
                        'assigned_users' => $assignedUsers,
                    ];
                });

                return $this->successResponse($items, 'Tasks retrieved successfully');
            } else {
                return $this->errorResponse('Permission denied');
            }
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }

    public function taskCreateAndUpdate(Request $request)
    {
        try {
            if ($request->task_id) {
                return $this->updateTask($request);
            } else {
                return $this->createTask($request);
            }
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }

    private function createTask(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id'   => 'required|exists:projects,id',
            'title'        => 'required|string|max:255',
            'priority'     => 'nullable|in:High,Medium,Low',
            'assigned_to'  => 'nullable|array|min:1',
            'duration'     => 'nullable|string',
            'description'  => 'nullable|string',
            'milestone_id' => 'nullable|exists:project_milestones,id',
            'stage_id'     => 'nullable|exists:task_stages,id'
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $validated = $validator->validated();
        $project = Project::with('teamMembers:id')->find($validated['project_id']);
        $isAssignedToProject = $project &&
            ($project->creator_id == Auth::id() || $project->teamMembers->contains('id', Auth::id()));

        $canCreateTask = Auth::user()->can('create-project-task') ||
            (Auth::user()->can('manage-own-project-task') && $isAssignedToProject);

        if ($canCreateTask) {
            $assignedTo         = $validated['assigned_to'] ?? [Auth::id()];
            $duration           = $validated['duration'] ?? now()->format('Y-m-d') . ' - ' . now()->format('Y-m-d');
            $task               = new ProjectTask();
            $task->project_id   = $validated['project_id'];
            $task->milestone_id = $validated['milestone_id'] ?? null;
            $task->title        = $validated['title'];
            $task->priority     = $validated['priority'] ?? 'Medium';
            $task->assigned_to  = json_encode($assignedTo);
            $task->duration     = $duration;
            $task->description  = $validated['description'] ?? '';

            if (isset($validated['stage_id'])) {
                $task->stage_id = $validated['stage_id'];
            } else {
                $firstStage     = TaskStage::where('created_by', creatorId())->orderBy('order')->first();
                $task->stage_id = $firstStage ? $firstStage->id : null;
            }

            $task->creator_id = Auth::id();
            $task->created_by = creatorId();
            $task->save();

            ActivityLog::create([
                'user_id'    => Auth::user()->id,
                'user_type'  => get_class(Auth::user()),
                'project_id' => $task->project_id,
                'log_type'   => 'Create Task',
                'remark'     => json_encode(['title' => $task->title]),
            ]);

            $notifier = app(NotificationService::class);
            foreach ($assignedTo as $assignedUserId) {
                if ((int) $assignedUserId === (int) Auth::id()) {
                    continue;
                }
                $notifier->sendToUser((int) $assignedUserId, [
                    'type' => 'task_assigned',
                    'title' => 'New task assigned',
                    'message' => 'You have been assigned task: ' . $task->title,
                    'item_type' => 'task',
                    'item_id' => $task->id,
                    'meta' => ['project_id' => $task->project_id, 'priority' => $task->priority],
                ]);
            }

            $assignedUsers = User::whereIn('id', $assignedTo)
                ->select('id', 'name', 'email', 'avatar')
                ->get()
                ->map(function ($user) {
                    return [
                        'id'     => $user->id,
                        'name'   => $user->name,
                        'email'  => $user->email,
                        'avatar' => $user->avatar ? getImageUrlPrefix() . '/' . $user->avatar : getImageUrlPrefix() . '/avatar.png',
                    ];
                });

            $responseData = [
                'id'             => $task->id,
                'title'          => $task->title,
                'description'    => $task->description,
                'priority'       => $task->priority,
                'duration'       => $task->duration,
                'stage_id'       => $task->stage_id,
                'project_id'     => $task->project_id,
                'milestone_id'   => $task->milestone_id,
                'assigned_to'    => $assignedUsers,
            ];

            return $this->successResponse($responseData, 'Task created successfully.');
        } else {
            return $this->errorResponse('Permission denied');
        }
    }

    private function updateTask(Request $request)
    {
        if (Auth::user()->can('edit-project-task')) {
            $validator = Validator::make($request->all(), [
                'task_id'      => 'required|exists:project_tasks,id',
                'title'        => 'required|string|max:255',
                'priority'     => 'nullable|in:High,Medium,Low',
                'assigned_to'  => 'required|array|min:1',
                'duration'     => 'required|string',
                'description'  => 'required|string',
                'stage_id'     => 'nullable|exists:task_stages,id'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            $validated = $validator->validated();
            $task      = ProjectTask::findOrFail($validated['task_id']);

            $task->title        = $validated['title'];
            $task->priority     = $validated['priority'];
            $task->assigned_to  = json_encode($validated['assigned_to']);
            $task->duration     = $validated['duration'];
            $task->description  = $validated['description'] ?? '';
            $task->milestone_id = $validated['milestone_id'] ?? null;
            $task->stage_id     = $validated['stage_id'] ?? $task->stage_id;
            $task->save();

            $assignedUsers = User::whereIn('id', $validated['assigned_to'])
                ->select('id', 'name', 'email', 'avatar')
                ->get()
                ->map(function ($user) {
                    return [
                        'id'     => $user->id,
                        'name'   => $user->name,
                        'email'  => $user->email,
                        'avatar' => $user->avatar ? getImageUrlPrefix() . '/' . $user->avatar : getImageUrlPrefix() . '/avatar.png',
                    ];
                });

            $responseData = [
                'id'             => $task->id,
                'title'          => $task->title,
                'description'    => $task->description,
                'priority'       => $task->priority,
                'duration'       => $task->duration,
                'stage_id'       => $task->stage_id,
                'project_id'     => $task->project_id,
                'milestone_id'   => $task->milestone_id,
                'assigned_users' => $assignedUsers,
            ];

            return $this->successResponse($responseData, 'Task updated successfully.');
        } else {
            return $this->errorResponse('Permission denied');
        }
    }

    public function taskDelete(Request $request)
    {
        try {
            if (Auth::user()->can('delete-project-task')) {
                $validator = Validator::make($request->all(), [
                    'task_id' => 'required|exists:project_tasks,id',
                ]);

                if ($validator->fails()) {
                    return $this->validationErrorResponse($validator->errors());
                }

                $task = ProjectTask::findOrFail($request->task_id);

                TaskComment::where('task_id', $task->id)->delete();
                TaskSubtask::where('task_id', $task->id)->delete();

                $task->delete();

                return $this->successResponse('', 'Task deleted successfully.');
            } else {
                return $this->errorResponse('Permission denied');
            }
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }

    public function taskDetails(Request $request)
    {
        try {
            if (Auth::user()->can('view-project-task')) {
                $validator = Validator::make($request->all(), [
                    'task_id' => 'required|exists:project_tasks,id',
                ]);

                if ($validator->fails()) {
                    return $this->validationErrorResponse($validator->errors());
                }

                $task = ProjectTask::with(['project:id,name', 'milestone:id,title'])
                    ->findOrFail($request->task_id);

                $assignedUsers = [];
                if ($task->assigned_to) {
                    $userIds       = is_array($task->assigned_to) ? $task->assigned_to : json_decode($task->assigned_to, true);
                    $assignedUsers = User::whereIn('id', $userIds)
                        ->select('id', 'name', 'email', 'avatar')
                        ->get()
                        ->map(function ($user) {
                            return [
                                'id'     => $user->id,
                                'name'   => $user->name,
                                'email'  => $user->email,
                                'avatar' => $user->avatar ? getImageUrlPrefix() . '/' . $user->avatar : getImageUrlPrefix() . '/avatar.png',
                            ];
                        });
                }

                $startDate = null;
                $endDate   = null;
                if ($task->duration && strpos($task->duration, ' - ') !== false) {
                    $dateRange = explode(' - ', $task->duration);
                    $startDate = trim($dateRange[0]);
                    $endDate   = trim($dateRange[1]);
                }

                $taskDetails = [
                    'id'             => $task->id,
                    'title'          => $task->title,
                    'description'    => $task->description,
                    'priority'       => $task->priority,
                    'start_date'     => $startDate,
                    'end_date'       => $endDate,
                    'stage_id'       => $task->stage_id,
                    'project_id'     => $task->project_id,
                    'milestone_id'   => $task->milestone_id,
                    'created_at'     => $task->created_at,
                    'project'        => $task->project,
                    'milestone'      => $task->milestone,
                    'assigned_users' => $assignedUsers,
                ];

                return $this->successResponse($taskDetails, 'Task details fetched successfully.');
            } else {
                return $this->errorResponse('Permission denied');
            }
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }

    public function taskStageUpdate(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'task_id'  => 'required|exists:project_tasks,id',
                'stage_id' => 'required|exists:task_stages,id'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            $task = ProjectTask::findOrFail($request->task_id);

            $assignedUserIds = $task->assigned_to ? (is_array($task->assigned_to) ? $task->assigned_to : json_decode($task->assigned_to, true)) : [];
            $canMove         = Auth::user()->can('edit-project-task') ||
                in_array((string)Auth::id(), $assignedUserIds) ||
                $task->creator_id == Auth::id();

            if ($canMove) {
                if ($request->stage_id != $task->stage_id) {
                    $oldStage = TaskStage::find($task->stage_id);
                    $newStage = TaskStage::find($request->stage_id);

                    $task->update(['stage_id' => $request->stage_id]);

                    ActivityLog::create([
                        'user_id'    => Auth::user()->id,
                        'user_type'  => get_class(Auth::user()),
                        'project_id' => $task->project_id,
                        'log_type'   => 'Move',
                        'remark'     => json_encode([
                            'title'      => $task->title,
                            'old_status' => $oldStage ? $oldStage->name : 'Unknown',
                            'new_status' => $newStage ? $newStage->name : 'Unknown',
                        ]),
                    ]);

                    app(NotificationService::class)->sendToRole('admin', [
                        'type' => 'status_changed',
                        'title' => 'Task status updated',
                        'message' => 'Task "' . $task->title . '" moved to ' . ($newStage?->name ?? 'new stage'),
                        'item_type' => 'task',
                        'item_id' => $task->id,
                        'meta' => ['project_id' => $task->project_id],
                    ]);

                    $assignedUserIds = $task->assigned_to
                        ? (is_array($task->assigned_to) ? $task->assigned_to : json_decode($task->assigned_to, true))
                        : [];
                    foreach ((array) $assignedUserIds as $uid) {
                        app(NotificationService::class)->sendToUser((int) $uid, [
                            'type' => 'status_changed',
                            'title' => 'Task status updated',
                            'message' => 'Task "' . $task->title . '" moved to ' . ($newStage?->name ?? 'new stage'),
                            'item_type' => 'task',
                            'item_id' => $task->id,
                            'meta' => ['project_id' => $task->project_id],
                        ]);
                    }

                    $request->merge(['old_stage_id' => $oldStage->id, 'new_stage_id' => $newStage->id]);
                }

                return $this->successResponse('', 'Task stage updated successfully.');
            } else {
                return $this->errorResponse('Permission denied');
            }
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }

    public function taskboard(Request $request)
    {
        try {
            if (Auth::user()->can('manage-project-task')) {
                $validator = Validator::make($request->all(), [
                    'project_id' => 'required|exists:projects,id',
                ]);

                if ($validator->fails()) {
                    return $this->validationErrorResponse($validator->errors());
                }

                $projectId = $request->project_id;
                $stages    = TaskStage::where('created_by', creatorId())->orderBy('order')->get();

                $query = ProjectTask::where('project_id', $projectId)
                    ->where(function ($q) {
                        if (Auth::user()->can('manage-any-project-task')) {
                            $q->where('created_by', creatorId());
                        } else if (Auth::user()->type == 'client') {
                            $clientProjectIds = Project::where('created_by', Auth::user()->created_by)
                                ->whereHas('clients', function ($query) {
                                    $query->where('client_id', Auth::id());
                                })
                                ->pluck('id');
                            $q->whereIn('project_id', $clientProjectIds);
                        } else {
                            $q->where(function ($subQ) {
                                $subQ->where('creator_id', Auth::id())
                                    ->orWhereJsonContains('assigned_to', (string)Auth::id());
                            });
                        }
                    });

                $allTasks = $query->with(['milestone:id,title'])->get();

                $stagesData = [];
                foreach ($stages as $key => $stage) {
                    $stageTasks = $allTasks->where('stage_id', $stage->id)->map(function ($task) use ($stages, $key) {
                        $assignedUsers = [];
                        if ($task->assigned_to) {
                            $userIds       = is_array($task->assigned_to) ? $task->assigned_to : json_decode($task->assigned_to, true);
                            $assignedUsers = User::whereIn('id', $userIds)
                                ->select('id', 'name', 'email', 'avatar')
                                ->get()
                                ->map(function ($user) {
                                    return [
                                        'id'     => $user->id,
                                        'name'   => $user->name,
                                        'email'  => $user->email,
                                        'avatar' => $user->avatar ? getImageUrlPrefix() . '/' . $user->avatar : getImageUrlPrefix() . '/avatar.png',
                                    ];
                                });
                        }

                        $startDate = null;
                        $endDate   = null;
                        if ($task->duration && strpos($task->duration, ' - ') !== false) {
                            $dateRange = explode(' - ', $task->duration);
                            $startDate = trim($dateRange[0]);
                            $endDate   = trim($dateRange[1]);
                        }

                        return [
                            'id'             => $task->id,
                            'title'          => $task->title,
                            'description'    => $task->description,
                            'priority'       => $task->priority,
                            'start_date'     => $startDate,
                            'end_date'       => $endDate,
                            'project_id'     => $task->project_id,
                            'milestone_id'   => $task->milestone_id,
                            'previous_stage' => isset($stages[$key - 1]) ? $stages[$key - 1]->id : 0,
                            'current_stage'  => $stages[$key]->id,
                            'next_stage'     => isset($stages[$key + 1]) ? $stages[$key + 1]->id : 0,
                            'assigned_users' => $assignedUsers,
                        ];
                    })->values();

                    $stagesData[] = [
                        'id'       => $stage->id,
                        'name'     => $stage->name,
                        'color'    => $stage->color,
                        'complete' => $stage->complete,
                        'order'    => $stage->order,
                        'tasks'    => $stageTasks,
                    ];
                }

                return $this->successResponse($stagesData, 'Taskboard retrieved successfully');
            } else {
                return $this->errorResponse('Permission denied');
            }
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }

    public function myWorkItems(Request $request)
    {
        try {
            $type = strtolower($request->get('type', 'all')); // all|task|bug
            $priorityFilter = $request->get('priority'); // High|Medium|Low
            $statusFilter = strtolower($request->get('status', '')); // pending|in_progress|completed
            $ongoingOnly = filter_var($request->get('ongoing_only', true), FILTER_VALIDATE_BOOLEAN);

            $tasks = collect();
            $bugs = collect();

            if (in_array($type, ['all', 'task'])) {
                $taskQuery = ProjectTask::with(['project:id,name,status', 'taskStage:id,name,complete'])
                    ->where('created_by', creatorId())
                    ->where(function ($q) {
                        $userId = Auth::id();
                        $q->where('creator_id', Auth::id())
                            // Handle assigned_to stored as JSON string ids, JSON numeric ids, or comma text.
                            ->orWhereJsonContains('assigned_to', (string) $userId)
                            ->orWhereJsonContains('assigned_to', $userId)
                            ->orWhere('assigned_to', 'like', '%"' . $userId . '"%')
                            ->orWhere('assigned_to', 'like', '%,' . $userId . ',%')
                            ->orWhere('assigned_to', 'like', $userId . ',%')
                            ->orWhere('assigned_to', 'like', '%,' . $userId);
                    })
                    ->when($priorityFilter, fn ($q) => $q->where('priority', $priorityFilter))
                    ->when($ongoingOnly, function ($q) {
                        $q->whereHas('project', function ($projectQ) {
                            $projectQ->whereRaw('LOWER(status) IN (?, ?, ?, ?, ?)', [
                                'in_progress',
                                'in progress',
                                'ongoing',
                                'on going',
                                'on_going',
                            ]);
                        });
                    })
                    ->latest('updated_at');

                $tasks = $taskQuery->get()->map(function ($task) {
                    $status = $this->statusFromStage(optional($task->taskStage)->name, (bool) optional($task->taskStage)->complete);
                    return [
                        'item_type' => 'task',
                        'id' => $task->id,
                        'project_id' => $task->project_id,
                        'project_name' => optional($task->project)->name,
                        'title' => $task->title,
                        'priority' => $task->priority,
                        'status' => $status,
                        'status_label' => optional($task->taskStage)->name,
                        'stage_id' => $task->stage_id,
                        'updated_at' => optional($task->updated_at)->toIso8601String(),
                    ];
                });
            }

            if (in_array($type, ['all', 'bug'])) {
                $bugQuery = ProjectBug::with(['project:id,name,status', 'bugStage:id,name,complete'])
                    ->where('created_by', creatorId())
                    ->where(function ($q) {
                        $userId = Auth::id();
                        $q->where('creator_id', Auth::id())
                            // Handle assigned_to stored as JSON string ids, JSON numeric ids, or comma text.
                            ->orWhereJsonContains('assigned_to', (string) $userId)
                            ->orWhereJsonContains('assigned_to', $userId)
                            ->orWhere('assigned_to', 'like', '%"' . $userId . '"%')
                            ->orWhere('assigned_to', 'like', '%,' . $userId . ',%')
                            ->orWhere('assigned_to', 'like', $userId . ',%')
                            ->orWhere('assigned_to', 'like', '%,' . $userId);
                    })
                    ->when($priorityFilter, fn ($q) => $q->where('priority', $priorityFilter))
                    ->when($ongoingOnly, function ($q) {
                        $q->whereHas('project', function ($projectQ) {
                            $projectQ->whereRaw('LOWER(status) IN (?, ?, ?, ?, ?)', [
                                'in_progress',
                                'in progress',
                                'ongoing',
                                'on going',
                                'on_going',
                            ]);
                        });
                    })
                    ->latest('updated_at');

                $bugs = $bugQuery->get()->map(function ($bug) {
                    $status = $this->statusFromStage(optional($bug->bugStage)->name, (bool) optional($bug->bugStage)->complete);
                    return [
                        'item_type' => 'bug',
                        'id' => $bug->id,
                        'project_id' => $bug->project_id,
                        'project_name' => optional($bug->project)->name,
                        'title' => $bug->title,
                        'priority' => $bug->priority,
                        'status' => $status,
                        'status_label' => optional($bug->bugStage)->name,
                        'stage_id' => $bug->stage_id,
                        'updated_at' => optional($bug->updated_at)->toIso8601String(),
                    ];
                });
            }

            $allItems = $tasks->concat($bugs)->sortByDesc('updated_at')->values();
            if (in_array($statusFilter, ['pending', 'in_progress', 'completed'])) {
                $allItems = $allItems->where('status', $statusFilter)->values();
            }

            $summary = [
                'total' => $allItems->count(),
                'tasks' => [
                    'total' => $tasks->count(),
                    'pending' => $tasks->where('status', 'pending')->count(),
                    'in_progress' => $tasks->where('status', 'in_progress')->count(),
                    'completed' => $tasks->where('status', 'completed')->count(),
                ],
                'bugs' => [
                    'total' => $bugs->count(),
                    'pending' => $bugs->where('status', 'pending')->count(),
                    'in_progress' => $bugs->where('status', 'in_progress')->count(),
                    'completed' => $bugs->where('status', 'completed')->count(),
                ],
                'priority' => [
                    'High' => $allItems->where('priority', 'High')->count(),
                    'Medium' => $allItems->where('priority', 'Medium')->count(),
                    'Low' => $allItems->where('priority', 'Low')->count(),
                ],
            ];

            return $this->successResponse([
                'items' => $allItems->values(),
                'summary' => $summary,
            ], 'Work items retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }

    public function workItemStatusUpdate(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'item_type' => 'required|in:task,bug',
                'item_id' => 'required|integer',
                'stage_id' => 'nullable|integer',
                'status' => 'nullable|string|in:pending,in_progress,completed,done,solved,resolved',
                'comment' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            $itemType = $request->item_type;
            $itemId = (int) $request->item_id;
            $explicitStageId = $request->stage_id;
            $status = $request->status;

            if ($itemType === 'task') {
                $task = ProjectTask::findOrFail($itemId);
                $assignedIds = $this->parseAssignedUserIds($task->assigned_to);
                $canUpdate = Auth::user()->can('edit-project-task')
                    || $task->creator_id == Auth::id()
                    || in_array((string) Auth::id(), $assignedIds, true);

                if (!$canUpdate) {
                    return $this->errorResponse('Permission denied', null, 403);
                }

                $newStageId = $explicitStageId ?: ($status ? $this->resolveTaskStageIdFromStatus($status) : null);
                if (!$newStageId) {
                    return $this->errorResponse('No matching task stage found', null, 422);
                }

                $oldStage = TaskStage::find($task->stage_id);
                $newStage = TaskStage::find($newStageId);
                $task->stage_id = $newStageId;
                $task->save();

                ActivityLog::create([
                    'user_id' => Auth::id(),
                    'user_type' => get_class(Auth::user()),
                    'project_id' => $task->project_id,
                    'log_type' => 'Move',
                    'remark' => json_encode([
                        'title' => $task->title,
                        'old_status' => optional($oldStage)->name,
                        'new_status' => optional($newStage)->name,
                        'comment' => $request->comment,
                    ]),
                ]);

                app(NotificationService::class)->sendToRole('admin', [
                    'type' => 'status_changed',
                    'title' => 'Task status updated from app',
                    'message' => 'Task "' . $task->title . '" moved to ' . (optional($newStage)->name ?? 'updated stage'),
                    'item_type' => 'task',
                    'item_id' => $task->id,
                    'meta' => ['project_id' => $task->project_id],
                ]);

                return $this->successResponse([
                    'item_type' => 'task',
                    'item_id' => $task->id,
                    'stage_id' => $task->stage_id,
                    'status_label' => optional($newStage)->name,
                    'status' => $this->statusFromStage(optional($newStage)->name, (bool) optional($newStage)->complete),
                ], 'Task status updated successfully.');
            }

            $bug = ProjectBug::findOrFail($itemId);
            $assignedIds = $this->parseAssignedUserIds($bug->assigned_to);
            $canUpdate = Auth::user()->can('edit-project-bug')
                || $bug->creator_id == Auth::id()
                || in_array((string) Auth::id(), $assignedIds, true);

            if (!$canUpdate) {
                return $this->errorResponse('Permission denied', null, 403);
            }

            $newStageId = $explicitStageId ?: ($status ? $this->resolveBugStageIdFromStatus($status) : null);
            if (!$newStageId) {
                return $this->errorResponse('No matching bug stage found', null, 422);
            }

            $oldStage = BugStage::find($bug->stage_id);
            $newStage = BugStage::find($newStageId);
            $bug->stage_id = $newStageId;
            $bug->save();

            ActivityLog::create([
                'user_id' => Auth::id(),
                'user_type' => get_class(Auth::user()),
                'project_id' => $bug->project_id,
                'log_type' => 'Move Bug',
                'remark' => json_encode([
                    'title' => $bug->title,
                    'old_status' => optional($oldStage)->name,
                    'new_status' => optional($newStage)->name,
                    'comment' => $request->comment,
                ]),
            ]);

            app(NotificationService::class)->sendToRole('admin', [
                'type' => 'status_changed',
                'title' => 'Bug status updated from app',
                'message' => 'Bug "' . $bug->title . '" moved to ' . (optional($newStage)->name ?? 'updated stage'),
                'item_type' => 'bug',
                'item_id' => $bug->id,
                'meta' => ['project_id' => $bug->project_id],
            ]);

            return $this->successResponse([
                'item_type' => 'bug',
                'item_id' => $bug->id,
                'stage_id' => $bug->stage_id,
                'status_label' => optional($newStage)->name,
                'status' => $this->statusFromStage(optional($newStage)->name, (bool) optional($newStage)->complete),
            ], 'Bug status updated successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }
}
