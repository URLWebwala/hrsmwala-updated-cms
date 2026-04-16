<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;
use Workdo\Hrm\Models\Attendance;
use Workdo\Hrm\Models\Employee;
use Workdo\Hrm\Models\Shift;

class RecalculateAttendances extends Command
{
    protected $signature = 'hrm:recalculate-attendances
        {--from= : Start date (Y-m-d)}
        {--to= : End date (Y-m-d)}
        {--employee= : Employee user_id}
        {--creator= : created_by (company/creator id)}
        {--attendance= : Attendance id (single record)}
        {--include-open : Recalculate records without clock_out using now()}
        {--dry-run : Show what would change without updating DB}
        {--chunk=500 : Chunk size for processing}
        {--limit= : Max records to process}';

    protected $description = 'Bulk recalculate attendance total/break/overtime/status';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $includeOpen = (bool) $this->option('include-open');
        $chunkSize = max(1, (int) $this->option('chunk'));
        $limit = $this->option('limit') !== null ? max(1, (int) $this->option('limit')) : null;

        $query = Attendance::query();

        if ($attendanceId = $this->option('attendance')) {
            $query->whereKey($attendanceId);
        }

        if ($creator = $this->option('creator')) {
            $query->where('created_by', $creator);
        }

        if ($employee = $this->option('employee')) {
            $query->where('employee_id', $employee);
        }

        if ($from = $this->option('from')) {
            $query->where('date', '>=', $from);
        }

        if ($to = $this->option('to')) {
            $query->where('date', '<=', $to);
        }

        if (!$includeOpen) {
            $query->whereNotNull('clock_out');
        }

        $query->orderBy('id');

        if ($limit !== null) {
            $query->limit($limit);
        }

        $total = (clone $query)->count();
        if ($total === 0) {
            $this->info('No attendance records found for the given filters.');
            return self::SUCCESS;
        }

        $this->info(sprintf(
            'Processing %d attendance record(s)%s...',
            $total,
            $dryRun ? ' (dry-run)' : ''
        ));

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $changed = 0;
        $skipped = 0;
        $processed = 0;

        /** @var Builder $chunkedQuery */
        $chunkedQuery = (clone $query);

        $chunkedQuery->chunkById($chunkSize, function ($attendances) use (
            $dryRun,
            $includeOpen,
            &$changed,
            &$skipped,
            &$processed,
            $bar,
            $limit
        ) {
            foreach ($attendances as $attendance) {
                if ($limit !== null && $processed >= $limit) {
                    return false; // stop chunking
                }

                $processed++;

                $clockIn = $attendance->clock_in;
                $clockOut = $attendance->clock_out;
                if (!$clockIn) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                if (!$clockOut && $includeOpen) {
                    $clockOut = Carbon::now($this->getCompanyTimezone((int) $attendance->created_by));
                }

                if (!$clockOut) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                $employee = Employee::where('user_id', $attendance->employee_id)
                    ->where('created_by', $attendance->created_by)
                    ->first();

                $shift = null;
                if (!empty($attendance->shift_id)) {
                    $shift = Shift::where('id', $attendance->shift_id)
                        ->where('created_by', $attendance->created_by)
                        ->first();
                } elseif ($employee && !empty($employee->shift)) {
                    $shift = Shift::where('id', $employee->shift)
                        ->where('created_by', $attendance->created_by)
                        ->first();
                }

                $calc = $this->calculateAttendanceData(
                    clockIn: $clockIn,
                    clockOut: $clockOut,
                    shift: $shift,
                    employee: $employee,
                    creatorId: (int) $attendance->created_by
                );

                $newTotal = $calc['total_hour']['total_working_hours'];
                $newBreak = $calc['total_hour']['total_break_hours'];
                $newOvertime = $calc['overtime_hours'];
                $newOvertimeAmount = $calc['overtime_amount'];
                $newStatus = $calc['status'];

                $isDifferent =
                    (string) number_format((float) ($attendance->total_hour ?? 0), 2, '.', '') !== (string) number_format((float) $newTotal, 2, '.', '') ||
                    (string) number_format((float) ($attendance->break_hour ?? 0), 2, '.', '') !== (string) number_format((float) $newBreak, 2, '.', '') ||
                    (string) number_format((float) ($attendance->overtime_hours ?? 0), 2, '.', '') !== (string) number_format((float) $newOvertime, 2, '.', '') ||
                    (string) number_format((float) ($attendance->overtime_amount ?? 0), 2, '.', '') !== (string) number_format((float) $newOvertimeAmount, 2, '.', '') ||
                    (string) ($attendance->status ?? '') !== (string) $newStatus;

                if (!$isDifferent) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                $changed++;

                if ($dryRun) {
                    $this->newLine();
                    $this->line(sprintf(
                        'Attendance #%d (employee %s, date %s): total %s→%s, break %s→%s, overtime %s→%s, status %s→%s',
                        $attendance->id,
                        $attendance->employee_id,
                        (string) $attendance->date,
                        $attendance->total_hour ?? '0.00',
                        number_format($newTotal, 2),
                        $attendance->break_hour ?? '0.00',
                        number_format($newBreak, 2),
                        $attendance->overtime_hours ?? '0.00',
                        number_format($newOvertime, 2),
                        $attendance->status ?? '-',
                        $newStatus
                    ));
                    // Resume progress bar after output
                    $bar->display();
                } else {
                    $attendance->update([
                        'total_hour' => $newTotal,
                        'break_hour' => $newBreak,
                        'overtime_hours' => $newOvertime,
                        'overtime_amount' => $newOvertimeAmount,
                        'status' => $newStatus,
                    ]);
                }

                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine(2);

        $this->info(sprintf(
            'Done. Processed: %d, Updated: %d, Unchanged/Skipped: %d%s',
            $processed,
            $changed,
            $skipped,
            $dryRun ? ' (dry-run)' : ''
        ));

        return self::SUCCESS;
    }

    private function getCompanyTimezone(int $creatorId): string
    {
        $settings = getCompanyAllSetting($creatorId);
        return $settings['timezone'] ?? $settings['company_timezone'] ?? config('app.timezone', 'UTC');
    }

    private function parseClockDateTime(mixed $value, string $timezone, ?Carbon $baseDate = null): Carbon
    {
        if ($value instanceof Carbon) {
            return $value->copy()->setTimezone($timezone);
        }

        $raw = trim((string) $value);
        if ($raw === '') {
            return Carbon::now($timezone);
        }

        if (preg_match('/^\d{1,2}:\d{2}(?::\d{2})?$/', $raw)) {
            $date = ($baseDate ? $baseDate->copy() : Carbon::now($timezone))->setTimezone($timezone);
            $time = preg_match('/^\d{1,2}:\d{2}$/', $raw) ? ($raw . ':00') : $raw;
            return Carbon::createFromFormat('Y-m-d H:i:s', $date->toDateString() . ' ' . $time, $timezone);
        }

        foreach (['Y-m-d H:i', 'Y-m-d H:i:s', 'Y-m-d\TH:i', 'Y-m-d\TH:i:s'] as $fmt) {
            try {
                return Carbon::createFromFormat($fmt, $raw, $timezone);
            } catch (\Throwable) {
                // try next
            }
        }

        return Carbon::parse($raw, $timezone)->setTimezone($timezone);
    }

    private function breakDuration(?Shift $shift, Carbon $baseDate, string $timezone): int
    {
        if (!$shift || !$shift->break_start_time || !$shift->break_end_time) {
            return 0;
        }

        $breakStart = $this->parseClockDateTime($shift->break_start_time, $timezone, $baseDate);
        $breakEnd = $this->parseClockDateTime($shift->break_end_time, $timezone, $baseDate);
        if ($breakEnd->lt($breakStart)) {
            $breakEnd->addDay();
        }

        return $breakStart->diffInMinutes($breakEnd);
    }

    private function getWorkingHour(?Shift $shift, string $timezone): float
    {
        if (!$shift || !$shift->start_time || !$shift->end_time) {
            return 0.0;
        }

        $base = Carbon::now($timezone);
        $start = $this->parseClockDateTime($shift->start_time, $timezone, $base);
        $end = $this->parseClockDateTime($shift->end_time, $timezone, $base);

        if (!empty($shift->is_night_shift) && $end->lt($start)) {
            $end->addDay();
        }

        $breakDuration = $this->breakDuration($shift, $base, $timezone);
        $totalMinutes = max(0, $start->diffInMinutes($end) - $breakDuration);
        return round($totalMinutes / 60, 2);
    }

    private function calculateTotalHours(string $clockIn, mixed $clockOut, ?Shift $shift, int $creatorId): array
    {
        $tz = $this->getCompanyTimezone($creatorId);

        $clockInTime = $this->parseClockDateTime($clockIn, $tz);
        $clockOutTime = $this->parseClockDateTime($clockOut, $tz, $clockInTime);

        if ($clockOutTime->lt($clockInTime)) {
            $clockOutTime->addDay();
        }

        $totalMinutes = $clockInTime->diffInMinutes($clockOutTime);
        $breakMinutes = 0;

        if ($shift && $shift->break_start_time && $shift->break_end_time) {
            $breakStart = $this->parseClockDateTime($shift->break_start_time, $tz, $clockInTime);
            $breakEnd = $this->parseClockDateTime($shift->break_end_time, $tz, $clockInTime);

            if ($breakEnd->lt($breakStart)) {
                $breakEnd->addDay();
            }

            if ($clockInTime->lte($breakStart) && $clockOutTime->gte($breakEnd)) {
                $breakMinutes = $this->breakDuration($shift, $clockInTime, $tz);
            } elseif ($clockInTime->lte($breakStart) && $clockOutTime->gt($breakStart) && $clockOutTime->lte($breakEnd)) {
                $breakMinutes = $breakStart->diffInMinutes($clockOutTime);
            } elseif ($clockInTime->gt($breakStart) && $clockInTime->lt($breakEnd) && $clockOutTime->gte($breakEnd)) {
                $breakMinutes = $clockInTime->diffInMinutes($breakEnd);
            } elseif ($clockInTime->gt($breakStart) && $clockOutTime->lt($breakEnd)) {
                $breakMinutes = 0;
            }
        }

        $workingMinutes = max(0, $totalMinutes - $breakMinutes);

        return [
            'total_working_hours' => round($workingMinutes / 60, 2),
            'total_break_hours' => round($breakMinutes / 60, 2),
        ];
    }

    private function calculateAttendanceData(
        mixed $clockIn,
        mixed $clockOut,
        ?Shift $shift,
        ?Employee $employee,
        int $creatorId
    ): array {
        $clockInStr = (string) $clockIn;
        $totalHourData = $this->calculateTotalHours($clockInStr, $clockOut, $shift, $creatorId);
        $totalHour = (float) $totalHourData['total_working_hours'];

        $tz = $this->getCompanyTimezone($creatorId);
        $standardHours = ($shift && $this->getWorkingHour($shift, $tz) > 0) ? $this->getWorkingHour($shift, $tz) : 8;
        $overtimeHours = max(0, round($totalHour - $standardHours, 2));

        $overtimeAmount = 0.0;
        if ($overtimeHours > 0 && $employee && !empty($employee->rate_per_hour)) {
            $overtimeAmount = round($overtimeHours * ((float) $employee->rate_per_hour), 2);
        }

        $status = 'absent';
        if ($totalHour > 0) {
            $halfDayThreshold = $standardHours / 2;
            if ($totalHour >= $standardHours) {
                $status = 'present';
            } elseif ($totalHour >= $halfDayThreshold) {
                $status = 'half day';
            } else {
                $status = 'absent';
            }
        }

        return [
            'total_hour' => $totalHourData,
            'overtime_hours' => $overtimeHours,
            'overtime_amount' => $overtimeAmount,
            'status' => $status,
        ];
    }
}

