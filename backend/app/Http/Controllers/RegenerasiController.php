<?php

namespace App\Http\Controllers;

use App\Models\Period;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class RegenerasiController extends Controller
{
    /**
     * Get list of all periods for archive view.
     */
    public function index()
    {
        return response()->json(Period::orderBy('start_year', 'desc')->get());
    }

    /**
     * Handle the regeneration process.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'new_kahima_name' => 'required|string',
            'new_kahima_nim' => 'required|string',
            'new_kahima_email' => 'required|email|unique:users,email',
            'new_kahima_password' => 'required|min:8',
            'current_password' => 'required',
            'period_name' => 'required|string', // e.g. "Kepengurusan 2025-2026"
            'start_year' => 'required|digits:4',
            'end_year' => 'required|digits:4',
        ]);

        // Verify current user password confirmation
        if (!Hash::check($request->current_password, Auth::user()->password)) {
            return response()->json(['message' => 'Password konfirmasi salah.'], 403);
        }

        // Must be superadmin/kahima
        // Middleware handles this usually, but good to check.

        try {
            DB::beginTransaction();

            // 1. Archive current active period(s)
            Period::where('is_active', true)->update([
                'is_active' => false,
                'archived_at' => now(),
            ]);

            // 2. Create New Period
            $newPeriod = Period::create([
                'name' => $request->period_name,
                'start_year' => $request->start_year,
                'end_year' => $request->end_year,
                'is_active' => true,
            ]);

            // 3. Create New Kahima User
            // Assign to new period, but ROLE is superadmin/kahima.
            $newKahima = User::create([
                'name' => $validated['new_kahima_name'],
                'email' => $validated['new_kahima_email'],
                'password' => $validated['new_kahima_password'], // Will be hashed by model cast
                'role' => 'Kahima',
                'status' => 'superadmin',
                'period_id' => $newPeriod->id,
                'department_id' => 'BPH',
                'nim' => $validated['new_kahima_nim'],
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Regenerasi berhasil! Silakan login dengan akun Kahima baru.',
                'user' => $newKahima,
                'period' => $newPeriod
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        // View details of a period (stats etc)
        $period = Period::findOrFail($id);
        return response()->json($period);
    }
}
