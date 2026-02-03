<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RabItem extends Model
{
    protected $fillable = ['rab_id', 'description', 'quantity', 'unit', 'price', 'total', 'category', 'type', 'period_id'];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new \App\Models\Scopes\CurrentPeriodScope);
    }

    public function rab()
    {
        return $this->belongsTo(Rab::class);
    }
}
