<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'program_id',
        'amount',
        'type',
        'description',
        'date',
        'status',
        'category',
        'payment_method'
    ];
    //
}
