<?php

use Illuminate\Support\Facades\Route;
use Workdo\Cashfree\Http\Controllers\CashfreeSettingsController;
use Workdo\Cashfree\Http\Controllers\CashfreeController;

Route::group(['middleware' => ['web', 'auth']], function () {
    Route::post('cashfree/settings/update', [CashfreeSettingsController::class, 'update'])->name('cashfree.settings.update');

    Route::post('plan/pay/with/cashfree', [CashfreeController::class, 'planPayWithCashfree'])->name('plan.cashfree.store');
    Route::get('plan/cashfree/status', [CashfreeController::class, 'planGetCashfreeStatus'])->name('plan.cashfree.status');
});
