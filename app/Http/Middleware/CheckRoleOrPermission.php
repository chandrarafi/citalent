<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRoleOrPermission
{
    /**
     * Handle an incoming request.
     *
     * Usage:
     * ->middleware('role:super-admin,hr-manager')
     * ->middleware('permission:manage-roles')
     */
    public function handle(Request $request, Closure $next, string $type, ...$values): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Super admin bypasses all role/permission gates
        if ($user->hasRole('super-admin')) {
            return $next($request);
        }

        if ($type === 'role') {
            if ($user->hasAnyRole($values)) {
                return $next($request);
            }
        } elseif ($type === 'permission') {
            if ($user->hasAnyPermission($values)) {
                return $next($request);
            }
        }

        abort(403, 'Akses tidak diizinkan untuk peran akun Anda.');
    }
}
