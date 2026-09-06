<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Auth;
use App\Models\Permission;
use App\Models\Role;

class RbacServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Share auth data with all views
        View::composer('*', function ($view) {
            $view->with([
                'authUser' => Auth::user(),
                'userPermissions' => Auth::check() ? Auth::user()->role?->permissions->pluck('name') : collect(),
                'currentUserRole' => Auth::check() ? Auth::user()?->role : null,
            ]);
        });
    }

    /**
     * Get permission for a route (can be used in blade).
     */
    public static function can(string $permission): bool
    {
        return Auth::check() && Auth::user()->can($permission);
    }

    /**
     * Check if user has role (can be used in blade).
     */
    public static function hasRole(string $role): bool
    {
        return Auth::check() && Auth::user()->hasRole($role);
    }

    /**
     * Get menu items based on permissions.
     */
    public static function getMenuItems(): array
    {
        if (!Auth::check()) {
            return [];
        }

        $user = Auth::user();

        // Default menu structure - override this based on your application needs
        $menuStructure = [
            [
                'title'  => 'Dashboard',
                'icon'   => 'ph ph-squares-four',
                'route'  => 'dashboard',
                'permission' => 'view-dashboard',
            ],
            // Add more menu items here based on your requirements
        ];

        // Filter menu items based on user permissions
        return array_filter($menuStructure, function ($item) use ($user) {
            return !isset($item['permission']) || $user->can($item['permission']);
        });
    }
}
