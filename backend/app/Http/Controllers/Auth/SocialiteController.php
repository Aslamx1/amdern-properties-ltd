<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    /**
     * Redirect to Google for authentication.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google callback.
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->with('error', 'Authentication failed. Please try again.');
        }

        // Find existing user by google_id or email
        $user = User::where('google_id', $googleUser->id)
            ->first();

        if (!$user) {
            $user = User::where('email', $googleUser->email)->first();
        }

        if ($user) {
            // Update existing user with Google info
            $user->update([
                'google_id' => $googleUser->id,
                'avatar' => $googleUser->avatar,
                'email_verified_at' => now(),
            ]);
        } else {
            // Create new user with default "Property Seeker" role
            $seekerRole = Role::where('name', 'Property Seeker')->first();

            $user = User::create([
                'name' => $googleUser->name,
                'email' => $googleUser->email,
                'google_id' => $googleUser->id,
                'avatar' => $googleUser->avatar,
                'email_verified_at' => now(),
                'password' => Hash::make(Str::random(16)),
                'user_type' => 'seeker',
                'role_id' => $seekerRole->id,
                'is_active' => true,
            ]);
        }

        Auth::login($user);

        return redirect()->route('dashboard')->with('success', 'Welcome to Amdern Properties!');
    }

    /**
     * Logout and revoke Google token.
     */
    public function logout()
    {
        Auth::logout();
        return redirect()->route('home')->with('success', 'You have been logged out.');
    }
}