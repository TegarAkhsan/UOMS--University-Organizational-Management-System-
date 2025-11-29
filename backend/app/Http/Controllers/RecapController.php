<?php

namespace App\Http\Controllers;

use App\Models\Recap;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RecapController extends Controller
{
    public function index($programId)
    {
        return Recap::where('program_id', $programId)->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'program_id' => 'required|exists:programs,id',
            'description' => 'required|string',
            'amount' => 'required|numeric',
            'type' => 'required|in:Debet,Kredit',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $path = null;
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('recaps', 'public');
        }

        $recap = Recap::create([
            'program_id' => $request->program_id,
            'description' => $request->description,
            'proof_no' => $request->proof_no,
            'amount' => $request->amount,
            'type' => $request->type,
            'file_path' => $path,
        ]);

        return response()->json($recap, 201);
    }

    public function destroy($id)
    {
        $recap = Recap::findOrFail($id);
        if ($recap->file_path) {
            Storage::disk('public')->delete($recap->file_path);
        }
        $recap->delete();
        return response()->json(null, 204);
    }
}
