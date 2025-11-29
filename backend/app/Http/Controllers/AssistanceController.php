<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AssistanceController extends Controller
{
    public function index()
    {
        return response()->json(\App\Models\Assistance::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_id' => 'nullable|exists:programs,id',
            'no' => 'nullable|integer',
            'description' => 'required|string',
            'status' => 'required|string',
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('assistances', 'public');
            $validated['file_path'] = \Illuminate\Support\Facades\Storage::url($path);
        }

        $assistance = \App\Models\Assistance::create($validated);
        return response()->json($assistance, 201);
    }
}
