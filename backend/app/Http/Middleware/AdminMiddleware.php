<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || !$request->user()->hasRole('Admin')) {
            return redirect('/login')->with('error', 'You do not have permission to access the admin panel.');
        }

        return $next($request);
    }
}