<?php

use Illuminate\Support\Facades\Route;
use Workdo\TimeTracker\Http\Controllers\AppVersionController;
use Workdo\TimeTracker\Http\Controllers\TrackerSettingController;
use Workdo\TimeTracker\Http\Controllers\AdminTrackerController;

Route::middleware(['auth', 'verified', 'PlanModuleCheck'])->group(function () {
    // Superadmin App Version Management
    Route::get('/app-versions', [AppVersionController::class, 'index'])->name('app-versions.index');
    Route::post('/app-versions/store', [AppVersionController::class, 'store'])->name('app-versions.store');
    
    // Admin Tracker Views
    Route::get('/timetracker/admin/summary', [AdminTrackerController::class, 'summary'])->name('timetracker.admin.summary');
    Route::get('/timetracker/admin/screenshots', [AdminTrackerController::class, 'screenshots'])->name('timetracker.admin.screenshots');

    // Admin Tracker Settings
    Route::get('/tracker-settings', [TrackerSettingController::class, 'index'])->name('tracker-settings.index');
    Route::post('/tracker-settings/update', [TrackerSettingController::class, 'update'])->name('tracker-settings.update');

    // Public/User download URL
    Route::get('/get-latest-desktop-app', [AppVersionController::class, 'getLatestDownloadUrl'])->name('desktop-app.latest');
});
