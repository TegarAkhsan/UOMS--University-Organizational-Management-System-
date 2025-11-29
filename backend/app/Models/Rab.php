<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rab extends Model
{
    protected $fillable = ['program_id', 'total_budget', 'status', 'revision_note'];

    public function items()
    {
        return $this->hasMany(RabItem::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}
