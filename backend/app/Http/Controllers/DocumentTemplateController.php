<?php

namespace App\Http\Controllers;

use App\Models\DocumentTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentTemplateController extends Controller
{
    public function index()
    {
        return response()->json(DocumentTemplate::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx',
        ]);

        $path = $request->file('file')->store('templates', 'public');

        $template = DocumentTemplate::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'file_path' => $path,
        ]);

        return response()->json($template, 201);
    }

    public function destroy($id)
    {
        $template = DocumentTemplate::findOrFail($id);
        if ($template->file_path) {
            Storage::disk('public')->delete($template->file_path);
        }
        $template->delete();

        return response()->json(null, 204);
    }
}
