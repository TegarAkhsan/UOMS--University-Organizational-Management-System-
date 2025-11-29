<?php

namespace App\Http\Controllers;

use App\Models\LetterRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LetterRequestController extends Controller
{
    public function index()
    {
        return response()->json(LetterRequest::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $letterRequest = LetterRequest::create($validated);

        return response()->json($letterRequest, 201);
    }

    public function update(Request $request, $id)
    {
        $letterRequest = LetterRequest::findOrFail($id);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('letters/fulfilled', 'public');
            $letterRequest->file_path = $path;
            $letterRequest->status = 'completed';

            // Automatically add to Surat Keluar Archive
            \App\Models\Letter::create([
                'program_id' => null, // Or link if possible
                'user_id' => \Illuminate\Support\Facades\Auth::id() ?? 1, // Fallback to 1 if not auth
                'title' => $letterRequest->title,
                'type' => 'Keluar',
                'file_path' => $path,
                'status' => 'approved',
                'category' => 'Internal', // Default
                'date' => now()->toDateString(),
                'no' => '-', // Manual or auto? For now dash.
                'sender' => 'Sekretaris',
                'recipient' => 'Kahima', // Or whoever requested
                'subject' => $letterRequest->title
            ]);
        }

        $letterRequest->save();

        return response()->json($letterRequest);
    }

    public function destroy($id)
    {
        $letterRequest = LetterRequest::findOrFail($id);
        if ($letterRequest->file_path) {
            Storage::disk('public')->delete($letterRequest->file_path);
        }
        $letterRequest->delete();

        return response()->json(null, 204);
    }
}
