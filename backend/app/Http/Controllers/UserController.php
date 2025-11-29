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
        // Security Check: Only Super Admin can create users
        if ($request->user()->status !== 'superadmin') {
            return response()->json(['message' => 'Unauthorized. Only Super Admin can create users.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string',
            'department_id' => 'nullable|string',
            'nim' => 'nullable|string',
            'points' => 'integer',
            'status' => 'nullable|string', // Allow status assignment
        ]);

        $validated['password'] = bcrypt($validated['password']);
        $user = \App\Models\User::create($validated);
        return response()->json($user, 201);
    }
    public function update(Request $request, $id)
    {
        // Security Check: Only Super Admin can update users
        if ($request->user()->status !== 'superadmin') {
            return response()->json(['message' => 'Unauthorized. Only Super Admin can update users.'], 403);
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
        // Security Check: Only Super Admin can delete users
        if ($request->user()->status !== 'superadmin') {
            return response()->json(['message' => 'Unauthorized. Only Super Admin can delete users.'], 403);
        }

        $user = \App\Models\User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
