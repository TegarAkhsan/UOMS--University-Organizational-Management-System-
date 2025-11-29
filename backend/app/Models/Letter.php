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
        'feedback'
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
