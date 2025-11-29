<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RabItem extends Model
{
    protected $fillable = ['rab_id', 'description', 'quantity', 'unit', 'price', 'total', 'category', 'type'];

    public function rab()
    {
        return $this->belongsTo(Rab::class);
    }
}
