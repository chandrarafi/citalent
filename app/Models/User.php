<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $phone
 * @property string|null $otp_code
 * @property Carbon|null $otp_expires_at
 * @property bool $is_active
 * @property string $status
 * @property int $failed_login_attempts
 * @property Carbon|null $banned_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'role_id', 'phone', 'otp_code', 'otp_expires_at', 'email_verified_at', 'is_active', 'status', 'failed_login_attempts', 'banned_at'])]
#[Hidden(['password', 'remember_token', 'otp_code'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'otp_expires_at' => 'datetime',
            'banned_at' => 'datetime',
            'is_active' => 'boolean',
            'failed_login_attempts' => 'integer',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if user account is active.
     */
    public function isActive(): bool
    {
        return (bool) ($this->is_active && $this->status === 'active' && !$this->isBanned());
    }

    /**
     * Check if user account is banned.
     */
    public function isBanned(): bool
    {
        return $this->status === 'banned' || $this->failed_login_attempts >= 10;
    }

    /**
     * Get the role assigned to the user.
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get candidate profile for kandidat role.
     */
    public function kandidatProfile()
    {
        return $this->hasOne(KandidatProfile::class);
    }

    /**
     * Check if candidate profile is complete.
     */
    public function isProfileComplete(): bool
    {
        if (!$this->hasRole('kandidat')) {
            return true;
        }

        return (bool) ($this->kandidatProfile && $this->kandidatProfile->is_complete);
    }

    /**
     * Check if user has a specific role or any of the given roles.
     *
     * @param string|array $role
     */
    public function hasRole(string|array $role): bool
    {
        if (!$this->role) {
            return false;
        }

        if (is_array($role)) {
            return in_array($this->role->name, $role);
        }

        return $this->role->name === $role;
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->role && in_array($this->role->name, $roles);
    }

    /**
     * Check if user has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->hasRole('super-admin')) {
            return true;
        }

        return (bool) ($this->role && $this->role->permissions->contains('name', $permission));
    }

    /**
     * Check if user has any of the given permissions.
     */
    public function hasAnyPermission(array $permissions): bool
    {
        if ($this->hasRole('super-admin')) {
            return true;
        }

        if (!$this->role) {
            return false;
        }

        foreach ($permissions as $permission) {
            if ($this->role->permissions->contains('name', $permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Determine if the entity has the given abilities.
     *
     * @param  iterable|string  $abilities
     * @param  array|mixed  $arguments
     * @return bool
     */
    public function can($abilities, $arguments = []): bool
    {
        if ($this->hasRole('super-admin')) {
            return true;
        }

        if (is_string($abilities) && $this->hasPermission($abilities)) {
            return true;
        }

        return parent::can($abilities, $arguments);
    }
}
