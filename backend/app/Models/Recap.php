<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recap extends Model
{
    protected $fillable = [
        'program_id',
        'description',
        'proof_no',
        'amount',
        'type',
        'file_path',
        'period_id',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new \App\Models\Scopes\CurrentPeriodScope);
    }
}
