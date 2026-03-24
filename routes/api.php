<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthApiController;
use App\Http\Controllers\Api\NotificationApiController;
use App\Http\Controllers\Api\SoundSettingApiController;

Route::middleware('api.json')->group(function () {

    Route::post('/login', [AuthApiController::class, 'login'])->middleware('throttle:6,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user();
        });
        Route::post('/logout', [AuthApiController::class, 'logout']);
        Route::post('/refresh', [AuthApiController::class, 'refresh']);
        Route::post('/change-password', [AuthApiController::class, 'changePassword']);
        Route::post('/edit-profile', [AuthApiController::class, 'editProfile']);
        Route::delete('/delete-account', [AuthApiController::class, 'deleteAccount']);

        // Notifications
        Route::get('/notifications', [NotificationApiController::class, 'index'])->name('api.notifications.index');
        Route::post('/notifications/mark-read', [NotificationApiController::class, 'markRead'])->name('api.notifications.mark-read');
        Route::post('/notifications/mark-all-read', [NotificationApiController::class, 'markAllRead'])->name('api.notifications.mark-all-read');
        Route::post('/notifications/clear-read', [NotificationApiController::class, 'clearRead'])->name('api.notifications.clear-read');

        // Sound settings
        Route::get('/sound-settings', [SoundSettingApiController::class, 'index'])->name('api.sound-settings.index');
        Route::post('/sound-settings/upload', [SoundSettingApiController::class, 'upload'])->name('api.sound-settings.upload');
        Route::post('/sound-settings/update', [SoundSettingApiController::class, 'update'])->name('api.sound-settings.update');
    });
});
