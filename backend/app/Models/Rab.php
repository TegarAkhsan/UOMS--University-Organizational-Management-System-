<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rab extends Model
{
    protected $fillable = ['program_id', 'total_budget', 'status', 'revision_note', 'period_id'];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new \App\Models\Scopes\CurrentPeriodScope);
    }

    public function items()
    {
        return $this->hasMany(RabItem::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}
