<?php

use Illuminate\Support\Facades\Route;
use Workdo\LandingPage\Http\Controllers\LandingPageController;
use Workdo\LandingPage\Http\Controllers\MarketplaceController;
use Workdo\LandingPage\Http\Controllers\CustomPageController;
use Workdo\LandingPage\Http\Controllers\NewsletterSubscriberController;



// CMS Management Routes
Route::middleware(['web', 'auth'])->prefix('landing-page')->name('landing-page.')->group(function () {
    Route::get('/', [LandingPageController::class, 'settings'])->name('index');
    Route::post('/store', [LandingPageController::class, 'store'])->name('store');
});

// Marketplace Management Routes
Route::middleware(['web', 'auth'])->prefix('marketplace')->name('marketplace.')->group(function () {
    Route::get('/settings', [MarketplaceController::class, 'settings'])->name('settings');
    Route::post('/settings', [MarketplaceController::class, 'storeSettings'])->name('settings.store');
});

// Custom Pages Management Routes
Route::middleware(['web', 'auth'])->prefix('custom-pages')->name('custom-pages.')->group(function () {
    Route::get('/', [CustomPageController::class, 'index'])->name('index');
    Route::get('/create', [CustomPageController::class, 'create'])->name('create');
    Route::post('/', [CustomPageController::class, 'store'])->name('store');
    Route::get('/{customPage}/edit', [CustomPageController::class, 'edit'])->name('edit');
    Route::put('/{customPage}', [CustomPageController::class, 'update'])->name('update');
    Route::delete('/{customPage}', [CustomPageController::class, 'destroy'])->name('destroy');
});

// Newsletter Subscribers Management Routes
Route::middleware(['web', 'auth'])->prefix('newsletter-subscribers')->name('newsletter-subscribers.')->group(function () {
    Route::get('/', [NewsletterSubscriberController::class, 'index'])->name('index');
    Route::delete('/{subscriber}', [NewsletterSubscriberController::class, 'destroy'])->name('destroy');
    Route::get('/export', [NewsletterSubscriberController::class, 'export'])->name('export');
});

// Public landing page
Route::middleware(['web'])->group(function () {
    Route::get('/', [LandingPageController::class, 'index'])->name('landing.page');
    Route::get('/pricing', [LandingPageController::class, 'pricing'])->name('pricing.page');
    Route::get('/marketplace/{slug?}', [MarketplaceController::class, 'index'])->name('marketplace');
    
    // Direct link shortcuts for mandatory pages
    Route::get('/privacy-policy', function() { return app(CustomPageController::class)->show(request(), 'privacy-policy'); })->name('privacy-policy.show');
    Route::get('/terms-and-conditions', function() { return app(CustomPageController::class)->show(request(), 'terms-and-conditions'); })->name('terms-and-conditions.show');
    Route::get('/refund-policy', function() { return app(CustomPageController::class)->show(request(), 'refund-policy'); })->name('refund-policy.show');
    Route::get('/contact-us', function() { return app(CustomPageController::class)->show(request(), 'contact-us'); })->name('contact-us.show');
    Route::get('/faq', function() { return app(CustomPageController::class)->show(request(), 'faq'); })->name('faq.show');

    Route::get('/page/{slug}', [CustomPageController::class, 'show'])->name('custom-page.show');
    Route::post('/newsletter/subscribe', [NewsletterSubscriberController::class, 'store'])->name('newsletter.subscribe');
});