<?php

namespace Workdo\Webhook\Extractors;

class HrmPayrollDataExtractor
{
    public static function extract($event)
    {
        if (!isset($event->payroll)) return [];

        $payroll = $event->payroll;

        return [
            'payroll' => [
                'id' => $payroll->id,
                'title' => $payroll->title,
                'payroll_frequency' => $payroll->payroll_frequency,
                'pay_period_start' => $payroll->pay_period_start?->format('d-m-Y') ?? null,
                'pay_period_end' => $payroll->pay_period_end?->format('d-m-Y') ?? null,
                'pay_date' => $payroll->pay_date?->format('d-m-Y') ?? null,
                'status' => $payroll->status,
                'total_gross_pay' => $payroll->total_gross_pay,
                'total_deductions' => $payroll->total_deductions,
                'total_net_pay' => $payroll->total_net_pay,
                'employee_count' => $payroll->employee_count,
                'created_at' => $payroll->created_at?->format('d-m-Y H:i') ?? null
            ]
        ];
    }
}
