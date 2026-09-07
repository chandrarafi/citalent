<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureCandidateProfileComplete
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if ($user && $user->hasRole('kandidat')) {
            if (!$user->isProfileComplete()) {
                // Allow profile edit, profile update, and logout
                if (!$request->routeIs('kandidat.profile', 'kandidat.profile.update', 'logout')) {
                    return redirect()->route('kandidat.profile')->with('error', 'Wajib melengkapi profil / biodata Anda terlebih dahulu sebelum mengakses halaman dashboard.');
                }
            }
        }

        return $next($request);
    }
}
