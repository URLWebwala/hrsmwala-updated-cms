<?php

namespace Workdo\TimeTracker\Models;

use Illuminate\Database\Eloquent\Model;

class AppVersion extends Model
{
    protected $table = 'app_versions';

    protected $fillable = [
        'version_name',
        'changelog',
        'file_path',
        'upload_date'
    ];

    protected $casts = [
        'upload_date' => 'date',
    ];
}
