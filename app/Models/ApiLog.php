<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApiLog extends Model
{
    use HasFactory;

    protected $table = 'api_logs';

    protected $fillable = [
        'method',
        'url',
        'route_name',
        'status_code',
        'status_text',
        'duration_ms',
        'ip_address',
        'user_id',
        'user_name',
        'user_email',
        'request_headers',
        'request_body',
        'response_body',
        'error_message',
        'error_trace',
        'is_slow',
        'is_failed',
    ];

    protected $casts = [
        'request_headers' => 'array',
        'request_body' => 'array',
        'duration_ms' => 'float',
        'is_slow' => 'boolean',
        'is_failed' => 'boolean',
        'status_code' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function scopeFailed($query)
    {
        return $query->where(function ($q) {
            $q->where('status_code', '>=', 400)->orWhere('is_failed', true);
        });
    }

    public function scopeSlow($query, $threshold = 800)
    {
        return $query->where('duration_ms', '>=', $threshold);
    }

    public function scopeCrashes($query)
    {
        return $query->where(function ($q) {
            $q->where('status_code', '>=', 500)->orWhereNotNull('error_message');
        });
    }
}
