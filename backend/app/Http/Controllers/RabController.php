<?php

namespace App\Http\Controllers;

use App\Models\Rab;
use App\Models\RabItem;
use Illuminate\Http\Request;

class RabController extends Controller
{
    public function index($programId)
    {
        return Rab::with('items')->where('program_id', $programId)->first();
    }

    public function store(Request $request)
    {
        $request->validate([
            'program_id' => 'required|exists:programs,id',
            'items' => 'required|array',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|integer',
            'items.*.unit' => 'required|string',
            'items.*.price' => 'required|numeric',
            'items.*.category' => 'required|string',
            'items.*.type' => 'nullable|string', // Pemasukan/Pengeluaran
            'status' => 'nullable|string'
        ]);

        $rab = Rab::updateOrCreate(
            ['program_id' => $request->program_id],
            ['status' => $request->status ?? 'draft']
        );

        // Clear existing items if updating
        $rab->items()->delete();

        $totalBudget = 0;

        foreach ($request->items as $item) {
            $total = $item['quantity'] * $item['price'];
            // Only add to total budget if it's an expense (Pengeluaran)
            if (($item['type'] ?? 'Pengeluaran') === 'Pengeluaran') {
                $totalBudget += $total;
            }

            RabItem::create([
                'rab_id' => $rab->id,
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'unit' => $item['unit'],
                'price' => $item['price'],
                'total' => $total,
                'category' => $item['category'],
                'type' => $item['type'] ?? 'Pengeluaran',
            ]);
        }

        $rab->total_budget = $totalBudget;
        $rab->save();

        return response()->json($rab->load('items'));
    }

    public function update(Request $request, $id)
    {
        $rab = Rab::findOrFail($id);
        $rab->update($request->only(['status', 'revision_note']));
        return response()->json($rab);
    }

    public function getAll()
    {
        try {
            return Rab::with(['program', 'items'])->get();
        } catch (\Exception $e) {
            \Log::error('Error fetching all RABs: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
