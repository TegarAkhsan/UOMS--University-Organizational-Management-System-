<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(\App\Models\User::with('department')->get());
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

        $validated['password'] = bcrypt($validated['password']);
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
}

