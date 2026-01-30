<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Program;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::query();
        if ($request->has('program_id')) {
            $query->where('program_id', $request->program_id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'program_id' => 'required|exists:programs,id',
                'title' => 'required|string',
                'description' => 'nullable|string',
                'deadline' => 'nullable|date',
                'assigned_to' => 'nullable|string',
                'status' => 'nullable|string',
                'attachment_file' => 'nullable|file|max:10240',
            ]);

            // Handle file upload
            if ($request->hasFile('attachment_file')) {
                $path = $request->file('attachment_file')->store('attachments', 'public');
                $validated['attachment_file'] = $path;
            }

            $task = Task::create($validated);
            $this->updateProgramProgress($task->program_id);

            return response()->json($task, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        $data = $request->all();

        if ($request->hasFile('submission_file')) {
            if ($task->submission_file) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($task->submission_file);
            }
            $path = $request->file('submission_file')->store('submissions', 'public');
            $data['submission_file'] = $path;
        }

        $task->update($data);
        $this->updateProgramProgress($task->program_id);

        return response()->json($task);
    }

    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        $programId = $task->program_id;
        $task->delete();
        $this->updateProgramProgress($programId);

        return response()->json(null, 204);
    }

    private function updateProgramProgress($programId)
    {
        $program = Program::with('tasks')->findOrFail($programId);
        $totalTasks = $program->tasks->count();

        if ($totalTasks === 0) {
            $program->update(['progress' => 0]);
            return;
        }

        $completedTasks = $program->tasks->where('status', 'Done')->count();
        $progress = round(($completedTasks / $totalTasks) * 100);

        $program->update(['progress' => $progress]);
    }
}
