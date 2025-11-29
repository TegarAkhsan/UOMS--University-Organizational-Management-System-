<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = ['id', 'name', 'full_name', 'description', 'head_name'];
    public $incrementing = false;
    protected $keyType = 'string';
    //
}
