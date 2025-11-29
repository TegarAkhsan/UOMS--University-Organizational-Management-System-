<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index()
    {
        return response()->json(\App\Models\Department::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|unique:departments,id',
            'name' => 'required|string',
            'full_name' => 'required|string',
            'description' => 'nullable|string',
            'head_name' => 'nullable|string',
        ]);

        $department = \App\Models\Department::create($validated);
        return response()->json($department, 201);
    }
}
