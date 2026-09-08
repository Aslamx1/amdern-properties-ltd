<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany as HasManyRelation;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $table = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'user_type',
        'google_id',
        'avatar',
        'remember_token',
        'email_verified_at',
        'role_id',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function properties(): HasManyRelation
    {
        return $this->hasMany(Property::class);
    }

    public function inquiries(): HasManyRelation
    {
        return $this->hasMany(Inquiry::class, 'seeker_id');
    }

    public function hasRole($role): bool
    {
        if (is_string($role)) {
            return $this->role && $this->role->name === $role;
        }

        return $this->role && in_array($this->role->name, (array) $role);
    }

    public function canAccessAgentDashboard(): bool
    {
        return $this->hasRole(['Estate Agent', 'Property Developer']);
    }
}