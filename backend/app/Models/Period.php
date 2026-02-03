<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Period extends Model
{
    protected $fillable = [
        'name',
        'start_year',
        'end_year',
        'is_active',
        'archived_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'archived_at' => 'datetime',
        'start_year' => 'integer',
        'end_year' => 'integer',
    ];

    public static function activeId()
    {
        return static::where('is_active', true)->value('id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
