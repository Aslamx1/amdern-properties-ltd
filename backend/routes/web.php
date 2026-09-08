<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------|
| Web Routes                                                                |
|--------------------------------------------------------------------------|
*/

Route::get('/', function () {
    return view('welcome');
})->name('home');

// Authentication routes
Route::get('/login', function () {
    return view('auth.login');
})->middleware('guest')->name('login');

Route::post('/login', function (Request $request) {
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (Auth::attempt($credentials)) {
        $request->session()->regenerate();

        // Check if user is admin and redirect to admin dashboard
        if (Auth::user()->hasRole('Admin')) {
            return redirect('/admin/dashboard');
        }

        return redirect()->intended('/dashboard');
    }

    return back()->with('error', 'Invalid credentials provided.');
})->middleware('guest');

Route::get('/register', function () {
    return view('auth.register');
})->middleware('guest')->name('register');

Route::post('/register', \App\Http\Controllers\Auth\RegisteredUserController::class)->middleware('guest');

Route::post('/logout', function (Request $request) {
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect('/')->with('success', 'You have been logged out.');
})->middleware('auth')->name('logout');

// Dashboard
Route::get('/dashboard', function () {
    return view('dashboard', ['user' => auth()->user()]);
})->middleware('auth')->name('dashboard');

// Admin routes
require base_path('routes/admin.php');

// API proxy routes for frontend integration
Route::prefix('api')->middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user()->load('role');
    });
});