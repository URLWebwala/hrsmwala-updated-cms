<?php

use Illuminate\Support\Facades\Route;
use Workdo\TimeTracker\Http\Controllers\Api\TrackerApiController;

Route::middleware(['api.json'])->group(function () {
    Route::middleware(['auth:sanctum'])->group(function () {
        // Tracker Settings
        Route::get('/settings', [TrackerApiController::class, 'getSettings']); // Alias for desktop clients
        Route::get('/tracker-settings', [TrackerApiController::class, 'getSettings']);
        Route::post('/update-tracker-settings', [TrackerApiController::class, 'updateSettings']); // To be implemented in a separate controller or here

        // Session Control
        Route::post('/start-session', [TrackerApiController::class, 'startSession']);
        Route::post('/stop-session', [TrackerApiController::class, 'stopSession']);
        Route::post('/pause-session', [TrackerApiController::class, 'pauseSession']);
        Route::post('/resume-session', [TrackerApiController::class, 'resumeSession']);

        // Activity Tracking
        Route::post('/heartbeat', [TrackerApiController::class, 'heartbeat']);
        Route::post('/upload-screenshot', [TrackerApiController::class, 'uploadScreenshot']);

        // Employee Dashboard
        Route::get('/my/summary', [TrackerApiController::class, 'getMySummary']);
        Route::get('/my/summary-week', [TrackerApiController::class, 'getMySummaryWeek']);
        Route::get('/my/time-entries', [TrackerApiController::class, 'getMyTimeEntries']);
        Route::get('/my/recent-tasks', [TrackerApiController::class, 'getMyRecentTasks']);
        Route::get('/my/screenshots', [TrackerApiController::class, 'getMyScreenshots']);
    });
});
