<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------|
| API Routes                                                                |
|--------------------------------------------------------------------------|
*/

Route::prefix('api/v1')->group(function () {
    // Authentication
    Route::post('/register', \App\Http\Controllers\Auth\RegisteredUserController::class);
    Route::post('/login', \App\Http\Controllers\Auth\LoginController::class);
    Route::post('/logout', \App\Http\Controllers\Auth\LoginController::class)->middleware('auth:sanctum');
    Route::post('/forgot-password', [\App\Http\Controllers\Auth\PasswordResetController::class, 'store']);
    Route::post('/reset-password', [\App\Http\Controllers\Auth\PasswordResetController::class, 'update']);

    // Google OAuth
    Route::get('/auth/google/redirect', [\App\Http\Controllers\Auth\SocialiteController::class, 'redirectToGoogle']);
    Route::get('/auth/google/callback', [\App\Http\Controllers\Auth\SocialiteController::class, 'handleGoogleCallback']);

    // Properties
    Route::get('/properties', [\App\Http\Controllers\PropertyController::class, 'index']);
    Route::post('/properties', [\App\Http\Controllers\PropertyController::class, 'store'])->middleware('auth:sanctum');
    Route::get('/properties/{id}', [\App\Http\Controllers\PropertyController::class, 'show']);
    Route::put('/properties/{id}', [\App\Http\Controllers\PropertyController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('/properties/{id}', [\App\Http\Controllers\PropertyController::class, 'destroy'])->middleware('auth:sanctum');

    // Inquiries
    Route::post('/inquiries', [\App\Http\Controllers\InquiryController::class, 'store']);
    Route::get('/inquiries', [\App\Http\Controllers\InquiryController::class, 'index'])->middleware('auth:sanctum');
    Route::patch('/inquiries/{id}', [\App\Http\Controllers\InquiryController::class, 'update'])->middleware('auth:sanctum');

    // Agent dashboard (protected by role)
    Route::middleware(['auth:sanctum', 'role:Estate Agent,Property Developer'])->group(function () {
        Route::get('/agent/dashboard', [\App\Http\Controllers\AgentDashboardController::class, 'index']);
        Route::get('/agent/properties', [\App\Http\Controllers\AgentDashboardController::class, 'properties']);
        Route::get('/agent/inquiries', [\App\Http\Controllers\AgentDashboardController::class, 'inquiries']);
    });
});

// Web routes
Route::get('/forgot-password', [\App\Http\Controllers\Auth\PasswordResetController::class, 'create'])->middleware('guest');
Route::post('/forgot-password', [\App\Http\Controllers\Auth\PasswordResetController::class, 'store'])->middleware('guest');
Route::get('/reset-password/{token}', [\App\Http\Controllers\Auth\PasswordResetController::class, 'edit'])->middleware('guest');
Route::post('/reset-password', [\App\Http\Controllers\Auth\PasswordResetController::class, 'update'])->middleware('guest');

Route::get('/auth/google', [\App\Http\Controllers\Auth\SocialiteController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [\App\Http\Controllers\Auth\SocialiteController::class, 'handleGoogleCallback']);