<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MeetingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // 1. Super Admins / BPH can see everything
        if ($user->department_id === 'BPH' || $user->status === 'superadmin' || $user->status === 'sub_super_admin_1' || $user->status === 'sub_super_admin_2') {
             // Optionally filter 'proker' meetings if they clutter the view, but usually they see all
             // For now, let's return all.
             return response()->json(\App\Models\Meeting::with('program')->orderBy('date', 'desc')->get());
        }

        // 2. Kadep (Head of Department)
        if ($user->role === 'Ketua Departemen' || $user->status === 'admin') {
             // Sees:
             // - Global meetings (audience='all', 'kadep_bph')
             // - Proker meetings (audience='proker_coord' OR 'proker_all') IF the proker belongs to their department
             
             // Get dept
             $dept = $user->department_id; // e.g. 'PSDM'

             $meetings = \App\Models\Meeting::with('program')
                ->where(function($q) {
                    $q->whereIn('audience', ['all', 'kadep_bph']);
                })
                ->orWhere(function($q) use ($dept) {
                    $q->whereIn('audience', ['proker_coord', 'proker_all'])
                      ->whereHas('program', function($subQ) use ($dept) {
                          $subQ->where('department_id', $dept);
                      });
                })
                ->orderBy('date', 'desc')
                ->get();
            
            return response()->json($meetings);
        }

        // 3. Staff / Regular User
        // Sees:
        // - Global meetings (audience='all')
        // - Proker meetings:
        //   - If audience='proker_coord': Must be Leader, Secretary, Treasurer, or Coordinator of that Proker.
        //   - If audience='proker_all': Must be ANY member (Leader, Sec, Treas, Coord, Staff) of that Proker.

        // Get user name for JSON checks (since sies stores names often, based on previous file inspections)
        $userName = $user->name;

        $meetings = \App\Models\Meeting::with('program')->orderBy('date', 'desc')->get()->filter(function ($meeting) use ($user, $userName) {
            
            if ($meeting->audience === 'all') return true;
            if ($meeting->audience === 'kadep_bph') return false; // Staff shouldn't see this

            // Proker based logic
            if (($meeting->audience === 'proker_coord' || $meeting->audience === 'proker_all') && $meeting->program) {
                $p = $meeting->program;

                // Check core roles
                $isLeader = ($p->leader_name === $userName || $p->leader === $userName);
                $isSecretary = ($p->secretary_name === $userName || $p->secretary === $userName);
                $isTreasurer = ($p->treasurer_name === $userName || $p->treasurer === $userName);
                
                // Parse Sies (JSON)
                $sies = is_string($p->sies) ? json_decode($p->sies, true) : $p->sies;
                $isCoordinator = false;
                $isStaff = false;

                if (is_array($sies)) {
                    foreach ($sies as $sie) {
                        if (isset($sie['coordinator']) && $sie['coordinator'] === $userName) {
                            $isCoordinator = true;
                        }
                        if (isset($sie['staff']) && is_array($sie['staff']) && in_array($userName, $sie['staff'])) {
                            $isStaff = true;
                        }
                    }
                }

                if ($meeting->audience === 'proker_coord') {
                    // Case A: Ketupel, Koordinator (and BPH Proker)
                    return $isLeader || $isSecretary || $isTreasurer || $isCoordinator;
                }

                if ($meeting->audience === 'proker_all') {
                    // Case B: Entire Committee
                    return $isLeader || $isSecretary || $isTreasurer || $isCoordinator || $isStaff;
                }
            }

            return false;
        });

        return response()->json($meetings->values());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'date' => 'required|date',
            'time' => 'required|string',
            'platform' => 'nullable|string',
            'link' => 'nullable|string',
            'audience' => 'required|string', // Changed from strict 'in' validation to string to allow extensible types
            'program_id' => 'nullable|exists:programs,id'
        ]);

        $validated['created_by'] = $request->user()->id;

        $meeting = \App\Models\Meeting::create($validated);
        return response()->json($meeting, 201);
    }

    public function destroy(Request $request, \App\Models\Meeting $meeting)
    {
        $user = $request->user();

        // Only creator can delete checking created_by
        if ($meeting->created_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized. Only the creator can delete this meeting.'], 403);
        }

        $meeting->delete();
        return response()->json(['message' => 'Meeting deleted successfully']);
    }
}
