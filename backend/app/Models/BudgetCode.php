<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BudgetCode extends Model
{
    protected $fillable = ['code', 'category', 'description'];
}
