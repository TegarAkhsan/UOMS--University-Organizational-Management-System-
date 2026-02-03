<?php

namespace App\Http\Controllers;

use App\Models\Period;
use App\Models\Program;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get all dashboard statistics for current period
     */
    public function stats()
    {
        // Use user's assigned period if available, otherwise default to active period
        $user = auth()->user();
        $periodId = $user->period_id ?? Period::where('is_active', true)->value('id');

        $activePeriod = Period::find($periodId);
        
        if (!$activePeriod) {
            return response()->json([
                'error' => 'No period found'
            ], 404);
        }

        // Get current date info
        $now = Carbon::now();
        $currentMonth = $now->month;
        $lastMonth = $now->copy()->subMonth();

        // === Stats Cards Data ===
        
        // Programs stats
        $allProkers = Program::withoutGlobalScope(\App\Models\Scopes\CurrentPeriodScope::class)
            ->where('period_id', $activePeriod->id)
            ->get();
        $activeProkers = $allProkers->filter(fn($p) => in_array(strtolower($p->status ?? ''), ['on progress', 'pending', 'on_progress']))->count();
        $completedProkers = $allProkers->filter(fn($p) => in_array(strtolower($p->status ?? ''), ['done', 'completed', 'finish']))->count();
        
        // This week's new prokers
        $newThisWeek = Program::withoutGlobalScope(\App\Models\Scopes\CurrentPeriodScope::class)
            ->where('period_id', $activePeriod->id)
            ->where('created_at', '>=', $now->copy()->startOfWeek())
            ->count();

        // Last week's count for comparison
        $lastWeekStart = $now->copy()->subWeek()->startOfWeek();
        $lastWeekEnd = $now->copy()->subWeek()->endOfWeek();
        $newLastWeek = Program::withoutGlobalScope(\App\Models\Scopes\CurrentPeriodScope::class)
            ->where('period_id', $activePeriod->id)
            ->whereBetween('created_at', [$lastWeekStart, $lastWeekEnd])
            ->count();

        // Transactions
        $transactions = Transaction::withoutGlobalScope(\App\Models\Scopes\CurrentPeriodScope::class)
            ->where('period_id', $activePeriod->id)
            ->get();
        $income = $transactions->where('type', 'Income')->where('status', 'Approved')->sum('amount');
        $expense = $transactions->where('type', 'Expense')->where('status', 'Approved')->sum('amount');
        $totalBalance = $income - $expense;

        // Last month balance for comparison
        $lastMonthIncome = Transaction::withoutGlobalScope(\App\Models\Scopes\CurrentPeriodScope::class)
            ->where('period_id', $activePeriod->id)
            ->where('type', 'Income')
            ->where('status', 'Approved')
            ->whereMonth('date', $lastMonth->month)
            ->whereYear('date', $lastMonth->year)
            ->sum('amount');
        $lastMonthExpense = Transaction::withoutGlobalScope(\App\Models\Scopes\CurrentPeriodScope::class)
            ->where('period_id', $activePeriod->id)
            ->where('type', 'Expense')
            ->where('status', 'Approved')
            ->whereMonth('date', $lastMonth->month)
            ->whereYear('date', $lastMonth->year)
            ->sum('amount');
        $lastMonthBalance = $lastMonthIncome - $lastMonthExpense;

        
        $balanceChange = $lastMonthBalance > 0 
            ? round((($totalBalance - $lastMonthBalance) / $lastMonthBalance) * 100, 1)
            : 0;

        // Pending Assistance
        $pendingAssistance = \App\Models\Assistance::withoutGlobalScope(\App\Models\Scopes\CurrentPeriodScope::class)
            ->where('period_id', $activePeriod->id)
            ->where('status', 'pending')
            ->count();

        // === Monthly Chart Data ===
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Financial Overview - Monthly Income vs Expense
        $financialData = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthIncome = Transaction::withoutGlobalScope(\App\Models\Scopes\CurrentPeriodScope::class)
                ->where('period_id', $activePeriod->id)
                ->where('type', 'Income')
                ->where('status', 'Approved')
                ->whereMonth('date', $m)
                ->sum('amount');
            $monthExpense = Transaction::withoutGlobalScope(\App\Models\Scopes\CurrentPeriodScope::class)
                ->where('period_id', $activePeriod->id)
                ->where('type', 'Expense')
                ->where('status', 'Approved')
                ->whereMonth('date', $m)
                ->sum('amount');
            
            $financialData[] = [
                'name' => $months[$m - 1],
                'income' => (int) $monthIncome,
                'expense' => (int) $monthExpense,
            ];
        }

        // Project Activity - Cumulative prokers per month
        $activityData = [];
        $cumulativeProkers = 0;
        $cumulativeCompleted = 0;
        
        for ($m = 1; $m <= 12; $m++) {
            // New prokers created in this month
            $monthProkers = Program::withoutGlobalScope(\App\Models\Scopes\CurrentPeriodScope::class)
                ->where('period_id', $activePeriod->id)
                ->whereMonth('created_at', $m)
                ->count();
            
            // Prokers completed in this month (based on updated_at and done status)
            $monthCompleted = Program::withoutGlobalScope(\App\Models\Scopes\CurrentPeriodScope::class)
                ->where('period_id', $activePeriod->id)
                ->whereIn(DB::raw('LOWER(status)'), ['done', 'completed', 'finish'])
                ->whereMonth('updated_at', $m)
                ->count();
            
            $cumulativeProkers += $monthProkers;
            $cumulativeCompleted += $monthCompleted;
            
            $activityData[] = [
                'name' => $months[$m - 1],
                'prokers' => $cumulativeProkers,
                'completed' => $cumulativeCompleted,
            ];
        }

        return response()->json([
            'period' => $activePeriod,
            'cards' => [
                'activeProkers' => $activeProkers,
                'completedProkers' => $completedProkers,
                'totalBalance' => $totalBalance,
                'pendingAssistance' => $pendingAssistance,
            ],
            'trends' => [
                'prokersTrend' => $newThisWeek > 0 ? "+{$newThisWeek} this week" : "No change",
                'prokersTrendUp' => $newThisWeek >= $newLastWeek,
                'completedTrend' => $completedProkers > 0 ? "On track" : "No completed yet",
                'completedTrendUp' => $completedProkers > 0,
                'balanceTrend' => $balanceChange != 0 ? ($balanceChange > 0 ? "+{$balanceChange}%" : "{$balanceChange}%") . " vs last month" : "No change",
                'balanceTrendUp' => $balanceChange >= 0,
                'assistanceTrend' => $pendingAssistance > 0 ? "Needs review" : "All clear",
                'assistanceTrendUp' => $pendingAssistance == 0,
            ],
            'financialData' => $financialData,
            'activityData' => $activityData,
        ]);
    }
}
