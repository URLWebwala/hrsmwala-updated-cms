<?php

namespace Workdo\Webhook\Extractors;

class HrmEmployeeDataExtractor
{
    public static function extract($event)
    {
        if (!isset($event->employee)) return [];

        $employee = $event->employee;

        return [
            'employee' => [
                'id' => $employee->id,
                'name' => $employee->name,
                'email' => $employee->email,
                'employee_id' => $employee->employee_id,
                'branch' => $employee->branch ? $employee->branch->name : null,
                'department' => $employee->department ? $employee->department->name : null,
                'designation' => $employee->designation ? $employee->designation->name : null,
                'created_at' => $employee->created_at?->format('d-m-Y H:i') ?? null
            ]
        ];
    }
}
