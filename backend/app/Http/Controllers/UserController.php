<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        // Filter users by the logged-in user's period context
        $currentUser = auth()->user();
        $targetPeriodId = $currentUser->period_id ?? \App\Models\Period::where('is_active', true)->value('id');

        $users = \App\Models\User::with('department')
            ->where('period_id', $targetPeriodId)
            ->get();

        return response()->json($users);
    }

    public function store(Request $request)
    {
        \Illuminate\Support\Facades\Log::info('Store User Request - User Status: ' . $request->user()->status);
        
        // Allow Super Admin, Kahima (Admin), Kadep, and Admin role to create users (Case Insensitive)
        $allowed = ['superadmin', 'kahima', 'kadep', 'admin'];
        if (!in_array(strtolower($request->user()->status), $allowed)) {
            return response()->json(['message' => 'Unauthorized. Insufficient permissions. Status: ' . $request->user()->status], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string',
            'department_id' => 'nullable|string',
            'nim' => 'nullable|string',
            'points' => 'integer',
            'status' => 'nullable|string', 
        ]);

        // Auto-assign department for Kadep if not sent
        if (in_array(strtolower($request->user()->status), ['kadep', 'admin']) && empty($validated['department_id'])) {
             // Use user's department if available
             if ($request->user()->department_id) {
                 $validated['department_id'] = $request->user()->department_id;
             }
        }

        // Assign to the creator's period context
        $currentUser = $request->user();
        $validated['period_id'] = $currentUser->period_id ?? \App\Models\Period::where('is_active', true)->value('id');

        if (isset($validated['department_id']) && $validated['department_id'] === 'BPH') {
            $validated['points'] = 1000;
        } else {
            $validated['points'] = $validated['points'] ?? 0;
        }
        
        // Hash password handled by model cast or mutator ideally, but explicit here if needed
        // $validated['password'] = Hash::make($validated['password']); 

        $user = \App\Models\User::create($validated);

        return response()->json($user, 201);
    }
    public function update(Request $request, $id)
    {
        \Illuminate\Support\Facades\Log::info('Update User Request - User Status: ' . $request->user()->status . ' for ID: ' . $id);

        // Allow Super Admin, Kahima, Kadep, and Admin
        $allowed = ['superadmin', 'kahima', 'kadep', 'admin'];
        if (!in_array(strtolower($request->user()->status), $allowed)) {
             return response()->json(['message' => 'Unauthorized.'], 403);
        }

        \Illuminate\Support\Facades\Log::info('Update User Request', ['id' => $id, 'data' => $request->all()]);
        $user = \App\Models\User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string',
            'email' => 'email|unique:users,email,' . $id,
            'role' => 'string',
            'department_id' => 'nullable|string',
            'nim' => 'nullable|string',
            'points' => 'integer',
            'violations' => 'integer',
            'violation_history' => 'nullable|array',
            'status' => 'string',
            'avatar' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['profile_photo_path'] = \Illuminate\Support\Facades\Storage::url($path);
        }

        $user->update($validated);
        return response()->json($user);
    }

    public function destroy(Request $request, $id)
    {
        \Illuminate\Support\Facades\Log::info('Destroy User Request - User Status: ' . $request->user()->status . ' for ID: ' . $id);
        
        // Allow Super Admin, Kahima, Kadep, and Admin
        $allowed = ['superadmin', 'kahima', 'kadep', 'admin'];
        if (!in_array(strtolower($request->user()->status), $allowed)) {
             return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $user = \App\Models\User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Get top contributor for current period (highest points)
     * Excludes BPH roles as they have fixed 1000 points
     */
    public function topContributor()
    {
        // Use user's assigned period if available, otherwise default to active period
        $user = auth()->user();
        $periodId = $user->period_id ?? \App\Models\Period::where('is_active', true)->value('id');

        $activePeriod = \App\Models\Period::find($periodId);
        
        if (!$activePeriod) {
            return response()->json(null);
        }

        // BPH roles that are excluded from top contributor (they have fixed 1000 points)
        $excludedRoles = [
            'Kahima', 'Ketua Himpunan',
            'Wakil Kahima', 'Wakil Ketua Himpunan',
            'Sekretaris Umum', 'Sekretaris 1', 'Sekretaris 2',
            'Bendahara Umum', 'Bendahara 1', 'Bendahara 2',
        ];

        // Get user with highest points in current period, excluding BPH
        $topUser = \App\Models\User::where('period_id', $activePeriod->id)
            ->whereNotIn('role', $excludedRoles)
            ->where('points', '>', 0) // Must have earned points
            ->orderByDesc('points')
            ->first();

        if (!$topUser) {
            return response()->json(null);
        }

        // Count projects led by this user
        $projectsLed = \App\Models\Program::withoutGlobalScope(\App\Models\Scopes\CurrentPeriodScope::class)
            ->where('period_id', $activePeriod->id)
            ->where('leader_name', $topUser->name)
            ->count();

        // Count tasks completed by this user
        // Note: Task model usually doesn't have period_id directly, it relies on Program.
        // But we need to make sure the Program query inside whereHas bypasses the scope.
        $tasksCompleted = \App\Models\Task::whereHas('program', function($q) use ($topUser, $activePeriod) {
                $q->withoutGlobalScope(\App\Models\Scopes\CurrentPeriodScope::class)
                  ->where('period_id', $activePeriod->id)
                  ->where('leader_name', $topUser->name);
            })
            ->where('status', 'done')
            ->count();

        // Only return if there's meaningful contribution
        if ($projectsLed == 0 && $tasksCompleted == 0 && $topUser->points <= 25) {
            return response()->json(null);
        }

        return response()->json([
            'id' => $topUser->id,
            'name' => $topUser->name,
            'points' => $topUser->points ?? 0,
            'avatar' => $topUser->profile_photo_path ?? null,
            'projects_led' => $projectsLed,
            'tasks_completed' => $tasksCompleted,
        ]);
    }
}
