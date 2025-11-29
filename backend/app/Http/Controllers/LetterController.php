<?php

namespace App\Http\Controllers;

use App\Models\Letter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class LetterController extends Controller
{
    public function index(Request $request)
    {
        $query = Letter::with(['program', 'user']);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Role-based filtering can be refined here.
        // For now, Sekretaris should see all letters if accessing archives.
        // Existing logic for 'pending_assistance' might conflict with 'archive' view.
        // We will prioritize request filters if present.

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|string', // Masuk / Keluar
            'file' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:10240',
        ]);

        $data = $request->all();
        $data['user_id'] = Auth::id();
        $data['status'] = $data['status'] ?? 'pending_assistance';

        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('letters', 'public');
        } else {
            $data['file_path'] = '';
        }

        // Auto Generate Number Logic for Surat Keluar
        if ($request->type === 'Keluar' && $request->boolean('auto_generate')) {
            $settings = \App\Models\Setting::pluck('value', 'key');
            $format = $settings['letter_format'] ?? '{no}/HIMA/{roman_month}/{year}';
            $lastNo = intval($settings['last_letter_number'] ?? 0);
            $newNo = $lastNo + 1;

            // Roman Numerals for Month
            $months = [1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV', 5 => 'V', 6 => 'VI', 7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII'];
            $currentMonth = $months[date('n')];
            $currentYear = date('Y');
            $paddedNo = str_pad($newNo, 3, '0', STR_PAD_LEFT);

            $generatedNo = str_replace(
                ['{no}', '{roman_month}', '{year}'],
                [$paddedNo, $currentMonth, $currentYear],
                $format
            );

            $data['no'] = $generatedNo;

            // Update Setting
            \App\Models\Setting::updateOrCreate(['key' => 'last_letter_number'], ['value' => $newNo]);
        }

        $letter = Letter::create($data);

        return response()->json($letter, 201);
    }

    public function update(Request $request, $id)
    {
        $letter = Letter::findOrFail($id);

        if ($request->has('status')) {
            $letter->status = $request->status;
        }

        if ($request->has('feedback')) {
            $letter->feedback = $request->feedback;
        }

        $letter->save();

        // Dynamic Program Tracker Update
        // When a letter (Proposal/LPJ) is fully approved (e.g. by Kahima), update the Program's status.
        // Assuming 'approved' or 'done' is the final status.
        if ($request->has('status') && in_array($request->status, ['approved', 'done', 'approved_kahima', 'completed'])) {
            if ($letter->program_id) {
                $program = $letter->program;
                if ($letter->category === 'Proposal') {
                    $program->update(['proposal_status' => 'approved']);
                } elseif ($letter->category === 'LPJ') {
                    $program->update(['lpj_status' => 'approved']);
                }
            }
        }

        return response()->json($letter);
    }

    public function show($id)
    {
        return Letter::with(['program', 'user'])->findOrFail($id);
    }
}
