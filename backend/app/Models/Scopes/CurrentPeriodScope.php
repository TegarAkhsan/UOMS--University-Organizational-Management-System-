<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use App\Models\Period;
use Illuminate\Support\Facades\Auth;

class CurrentPeriodScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model)
    {
        // Skip scope during migrations or when periods table doesn't exist
        try {
            // 1. Check if viewing a specific archive period via request
            if (request()->has('archive_period_id')) {
                $builder->where('period_id', request('archive_period_id'));
                return;
            }

            // 2. Check if User is assigned to a specific Period
            // (e.g. Old Kahima viewing their archive)
            $user = Auth::user();
            if ($user && $user->period_id) {
                $builder->where('period_id', $user->period_id);
                return;
            }

            // 3. Default: Show Active Period data
            $activeId = Period::where('is_active', true)->value('id');
            if ($activeId) {
                $builder->where('period_id', $activeId);
            }
        } catch (\Exception $e) {
            // Silently fail during migrations or if periods table doesn't exist
        }
    }
}
