<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'label',
        'kelompok',
        'url',
        'icon',
        'tone',
        'order',
        'parent_id',
        'permission_name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Menu::class, 'parent_id')->orderBy('order');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'menu_role');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('order');
    }

    /**
     * Get authorized menus for the given user, formatted for 1st-Pouf navigation.
     *
     * @return array<int, array{id: int, name: string, href: string, label: string, icon: string, tone: string, kelompok: ?string}>
     */
    public static function getAuthorizedMenusFor(?User $user): array
    {
        if (!$user) {
            return [];
        }

        // Super admin sees all active top-level menus
        if ($user->hasRole('super-admin')) {
            return static::active()
                ->whereNull('parent_id')
                ->get()
                ->map(fn (Menu $m) => [
                    'id' => $m->id,
                    'name' => $m->name,
                    'href' => $m->url,
                    'label' => $m->label,
                    'icon' => $m->icon,
                    'tone' => $m->tone,
                    'kelompok' => $m->kelompok,
                ])
                ->all();
        }

        // Filter menus based on user role and permissions
        $userRoleId = $user->role_id;

        return static::active()
            ->whereNull('parent_id')
            ->where(function (Builder $query) use ($user, $userRoleId) {
                if ($userRoleId) {
                    $query->whereHas('roles', function (Builder $q) use ($userRoleId) {
                        $q->where('roles.id', $userRoleId);
                    });
                }
                if ($user->role) {
                    $userPermissions = $user->role->permissions->pluck('name')->all();
                    $query->orWhereIn('permission_name', $userPermissions);
                }
                // Menus with no role and no permission restriction are public to all logged-in users
                $query->orWhere(function (Builder $q) {
                    $q->whereDoesntHave('roles')->whereNull('permission_name');
                });
            })
            ->get()
            ->map(fn (Menu $m) => [
                'id' => $m->id,
                'name' => $m->name,
                'href' => $m->url,
                'label' => $m->label,
                'icon' => $m->icon,
                'tone' => $m->tone,
                'kelompok' => $m->kelompok,
            ])
            ->all();
    }
}
