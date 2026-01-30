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
        'attachment_file'
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}
