<?php

namespace Workdo\Hrm\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeaveApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:users,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'leave_duration' => 'required|in:full_day,half_day',
            'half_day_session' => 'nullable|in:first_half,second_half',
            'reason' => 'required|string',
            'attachment' => 'nullable|string',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $leaveDuration = $this->input('leave_duration');
            $startDate = $this->input('start_date');
            $endDate = $this->input('end_date');
            $session = $this->input('half_day_session');

            if ($leaveDuration === 'half_day') {
                if ($startDate && $endDate && $startDate !== $endDate) {
                    $validator->errors()->add('end_date', __('For half day leave, start date and end date must be the same.'));
                }

                if (empty($session)) {
                    $validator->errors()->add('half_day_session', __('Please select first half or second half.'));
                }
            }
        });
    }
}