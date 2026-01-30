<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    public function index()
    {
        return response()->json(Program::with(['department', 'tasks'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'progress' => 'integer',
            'department_id' => 'nullable|string',
            'leader_name' => 'nullable|string',
            'secretary_name' => 'nullable|string',
            'treasurer_name' => 'nullable|string',
            'deadline' => 'nullable|date',
            'objectives' => 'nullable|string',
            'benefits' => 'nullable|string',
            'impact' => 'nullable|string',
            'sies' => 'nullable|array',
            'proposal_status' => 'nullable|string',
            'lpj_status' => 'nullable|string',
            'is_archived' => 'nullable|boolean',
        ]);

        $program = Program::create($validated);
        $this->assignRolesAndPoints($program);
        return response()->json($program, 201);
    }

    public function show($id)
    {
        return response()->json(Program::with(['department', 'tasks'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $program = Program::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|string',
            'progress' => 'integer',
            'department_id' => 'nullable|string',
            'leader_name' => 'nullable|string',
            'secretary_name' => 'nullable|string',
            'treasurer_name' => 'nullable|string',
            'deadline' => 'nullable|date',
            'objectives' => 'nullable|string',
            'benefits' => 'nullable|string',
            'impact' => 'nullable|string',
            'sies' => 'nullable|array',
            'proposal_status' => 'nullable|string',
            'lpj_status' => 'nullable|string',
            'is_archived' => 'nullable|boolean',
            'timeline' => 'nullable|array',
        ]);

        $program->update($validated);
        $this->assignRolesAndPoints($program);
        return response()->json($program);
    }

    public function destroy($id)
    {
        Program::findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    private function assignRolesAndPoints(Program $program)
    {
        \Illuminate\Support\Facades\Log::info('Assigning roles for program: ' . $program->title);

        // Assign Ketupel
        if ($program->leader_name) {
            \Illuminate\Support\Facades\Log::info('Assigning Ketupel: ' . $program->leader_name);
            $this->updateUserRoleAndPoints($program->leader_name, 'ketupel', 100);
        }

        // Assign Sekretaris BPK
        if ($program->secretary_name) {
            $this->updateUserRoleAndPoints($program->secretary_name, 'sekretaris_bpk', 20);
        }

        // Assign Bendahara BPK
        if ($program->treasurer_name) {
            $this->updateUserRoleAndPoints($program->treasurer_name, 'bendahara_bpk', 20);
        }

        // Assign Sies
        if ($program->sies) {
            foreach ($program->sies as $sie) {
                // Coordinator
                if (isset($sie['coordinator']) && $sie['coordinator']) {
                    $this->updateUserRoleAndPoints($sie['coordinator'], 'coordinator_sie', 20);
                }
                // Staff
                if (isset($sie['staff']) && is_array($sie['staff'])) {
                    foreach ($sie['staff'] as $staffName) {
                        $this->updateUserRoleAndPoints($staffName, 'staff_sie', 10);
                    }
                }
            }
        }
    }

    private function updateUserRoleAndPoints($name, $role, $points)
    {
        $user = \App\Models\User::where('name', $name)->first();
        if ($user) {
            \Illuminate\Support\Facades\Log::info("Found user: {$user->name}, Current Role: {$user->role}, Target Role: {$role}");

            // Only update if role is different (to prevent spamming points on every save)
            // Exception: Allow upgrading role (e.g. Staff -> Koor)
            // Hierarchy check could be added here, but for now simple check
            if ($user->role !== $role) {
                // Prevent downgrading high roles (e.g. Ketupel shouldn't become Staff)
                $highRoles = ['ketupel', 'sekretaris_bpk', 'bendahara_bpk'];
                if (in_array($user->role, $highRoles) && !in_array($role, $highRoles)) {
                    \Illuminate\Support\Facades\Log::info("Skipping downgrade for {$user->name} from {$user->role} to {$role}");
                    return;
                }

                $user->role = $role;
                $user->points += $points;
                $user->save();
                \Illuminate\Support\Facades\Log::info("Updated user {$user->name} to role {$role} with {$points} points.");
            } else {
                \Illuminate\Support\Facades\Log::info("User {$user->name} already has role {$role}. Skipping update.");
            }
        } else {
            \Illuminate\Support\Facades\Log::warning("User not found for name: {$name}");
        }
    }
}
