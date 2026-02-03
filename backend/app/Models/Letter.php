<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Letter extends Model
{
    protected $fillable = [
        'program_id',
        'user_id',
        'title',
        'no',
        'subject',
        'sender',
        'recipient',
        'date',
        'category',
        'status',
        'type',
        'file_path',
        'feedback',
        'period_id',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new \App\Models\Scopes\CurrentPeriodScope);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
