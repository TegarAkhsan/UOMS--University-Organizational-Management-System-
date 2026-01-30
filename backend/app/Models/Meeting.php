<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    protected $fillable = ['title', 'date', 'time', 'platform', 'link', 'audience', 'program_id'];

    /**
     * Get the program (proker) associated with this meeting.
     */
    public function program()
    {
        return $this->belongsTo(Program::class, 'program_id');
    }
}
