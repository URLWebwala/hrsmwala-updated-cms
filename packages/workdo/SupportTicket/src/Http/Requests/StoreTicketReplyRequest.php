<?php

namespace Workdo\SupportTicket\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketReplyRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'description' => 'required|string',
            'files.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx,txt,zip|max:10240'
        ];
    }
}