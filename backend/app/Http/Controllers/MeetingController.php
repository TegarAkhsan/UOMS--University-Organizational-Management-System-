<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MeetingController extends Controller
{
    public function index()
    {
        return response()->json(\App\Models\Meeting::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'date' => 'required|date',
            'time' => 'required|string',
            'platform' => 'nullable|string',
            'link' => 'nullable|string',
        ]);

        $meeting = \App\Models\Meeting::create($validated);
        return response()->json($meeting, 201);
    }
}
