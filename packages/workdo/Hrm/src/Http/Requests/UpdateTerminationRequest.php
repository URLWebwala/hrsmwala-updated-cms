<?php

namespace Workdo\Hrm\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTerminationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:users,id',
            'termination_type_id' => 'required|exists:termination_types,id',
            'notice_date' => 'nullable|date|before_or_equal:termination_date',
            'termination_date' => 'required|date',
            'reason' => 'required|max:255',
            'description' => 'nullable',
            'document' => 'nullable|string',
            'status' => 'nullable|in:pending,approved,rejected',
        ];
    }
}
