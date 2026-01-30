<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    protected $fillable = [
        'title',
        'status',
        'progress',
        'department_id',
        'description',
        'objectives',
        'benefits',
        'impact',
        'leader_name',
        'secretary_name',
        'treasurer_name',
        'deadline',
        'sies',
        'proposal_status',
        'lpj_status',
        'timeline'
    ];

    protected $casts = [
        'sies' => 'array',
        'timeline' => 'array',
    ];

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id', 'id'); // Assuming department_id is string and id in departments is string (e.g. 'BPH')
    }

    public function rab()
    {
        return $this->hasOne(Rab::class);
    }
}
