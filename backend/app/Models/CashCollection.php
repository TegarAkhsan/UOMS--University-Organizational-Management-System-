<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\CashPayment;
use App\Models\User;

class CashCollection extends Model
{
    protected $fillable = ['title', 'amount', 'created_by', 'period_id'];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new \App\Models\Scopes\CurrentPeriodScope);
    }

    public function payments()
    {
        return $this->hasMany(CashPayment::class, 'collection_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
