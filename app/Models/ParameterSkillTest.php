<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ParameterSkillTest extends Model
{
    use HasFactory;

    protected $table = 'parameter_skill_tests';

    protected $fillable = [
        'kd_jabatan',
        'jenis_tahap',
        'parameter',
        'bobot',
        'icon',
        'urutan',
        'active',
    ];

    protected $casts = [
        'bobot' => 'integer',
        'urutan' => 'integer',
        'active' => 'boolean',
    ];

    public function jabatan(): BelongsTo
    {
        return $this->belongsTo(Jabatan::class, 'kd_jabatan', 'kd_jabatan');
    }

    public function details(): HasMany
    {
        return $this->hasMany(DetailParameterSkillTest::class, 'parameter_skill_test_id')->orderBy('urutan');
    }

    public function yangDinilai(): HasMany
    {
        return $this->details();
    }

    public function scopeTahap($query, string $tahap)
    {
        return $query->where('jenis_tahap', $tahap);
    }
}
