<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\CashCollection;
use App\Models\User;

class CashPayment extends Model
{
    protected $fillable = ['collection_id', 'user_id', 'period', 'is_paid', 'paid_at', 'period_id'];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new \App\Models\Scopes\CurrentPeriodScope);
    }

    public function collection()
    {
        return $this->belongsTo(CashCollection::class, 'collection_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
