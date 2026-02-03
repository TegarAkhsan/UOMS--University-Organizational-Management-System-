<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'title',
        'status',
        'assigned_to',
        'description',
        'deadline',
        'submission_file',
        'submission_link',
        'revision_note',
        'attachment_file',
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
}
