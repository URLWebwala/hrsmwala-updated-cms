<?php

namespace Workdo\Webhook\Extractors;

class HrmLeaveDataExtractor
{
    public static function extract($event)
    {
        if (!isset($event->leaveapplication)) return [];

        $leave = $event->leaveapplication;

        return [
            'leave' => [
                'id' => $leave->id,
                'employee' => $leave->employee ? $leave->employee->name : null,
                'leave_type' => $leave->leaveType ? $leave->leaveType->title : null,
                'applied_on' => $leave->applied_on?->format('d-m-Y') ?? null,
                'start_date' => $leave->start_date?->format('d-m-Y') ?? null,
                'end_date' => $leave->end_date?->format('d-m-Y') ?? null,
                'total_leave_days' => $leave->total_leave_days,
                'leave_reason' => $leave->leave_reason,
                'remark' => $leave->remark,
                'status' => $leave->status,
                'created_at' => $leave->created_at?->format('d-m-Y H:i') ?? null
            ]
        ];
    }
}
