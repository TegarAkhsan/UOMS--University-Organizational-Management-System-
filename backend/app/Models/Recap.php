<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recap extends Model
{
    protected $fillable = [
        'program_id',
        'description',
        'proof_no',
        'amount',
        'type',
        'file_path'
    ];
}
