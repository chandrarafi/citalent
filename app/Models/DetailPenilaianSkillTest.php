<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailPenilaianSkillTest extends Model
{
    use HasFactory;

    protected $table = 'detail_penilaian_skill_tests';

    protected $fillable = [
        'penilaian_skill_test_id',
        'parameter_skill_test_id',
        'detail_parameter_skill_test_id',
        'skor',
        'catatan',
    ];

    protected $casts = [
        'skor' => 'integer',
    ];

    public function penilaianSkillTest(): BelongsTo
    {
        return $this->belongsTo(PenilaianSkillTest::class, 'penilaian_skill_test_id');
    }

    public function parameterSkillTest(): BelongsTo
    {
        return $this->belongsTo(ParameterSkillTest::class, 'parameter_skill_test_id');
    }

    public function detailParameterSkillTest(): BelongsTo
    {
        return $this->belongsTo(DetailParameterSkillTest::class, 'detail_parameter_skill_test_id');
    }
}
