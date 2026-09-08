<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailParameterSkillTest extends Model
{
    use HasFactory;

    protected $table = 'detail_parameter_skill_tests';

    protected $fillable = [
        'parameter_skill_test_id',
        'yang_dinilai',
        'urutan',
    ];

    protected $casts = [
        'urutan' => 'integer',
    ];

    public function parameterSkillTest(): BelongsTo
    {
        return $this->belongsTo(ParameterSkillTest::class, 'parameter_skill_test_id');
    }
}
