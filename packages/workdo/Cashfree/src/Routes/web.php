<?php

use Illuminate\Support\Facades\Route;
use Workdo\Cashfree\Http\Controllers\CashfreeSettingsController;

Route::group(['middleware' => ['web', 'auth']], function () {
    Route::post('cashfree/settings/update', [CashfreeSettingsController::class, 'update'])->name('cashfree.settings.update');
});
