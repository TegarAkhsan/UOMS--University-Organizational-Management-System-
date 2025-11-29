<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index()
    {
        return response()->json(\App\Models\Transaction::orderBy('date', 'desc')->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_id' => 'nullable|exists:programs,id',
            'amount' => 'required|numeric',
            'type' => 'required|string',
            'description' => 'required|string',
            'date' => 'required|date',
            'status' => 'required|string',
            'category' => 'nullable|string',
            'payment_method' => 'nullable|string',
            'receipt' => 'nullable|file|max:2048',
        ]);

        if ($request->hasFile('receipt')) {
            $path = $request->file('receipt')->store('receipts', 'public');
            $validated['receipt_path'] = \Illuminate\Support\Facades\Storage::url($path);
        }

        $transaction = \App\Models\Transaction::create($validated);
        return response()->json($transaction, 201);
    }

    public function summary()
    {
        $programIncome = \App\Models\Transaction::where('type', 'Income')->sum('amount');
        $totalExpense = \App\Models\Transaction::where('type', 'Expense')->sum('amount');

        return response()->json([
            'program_income' => $programIncome,
            'total_expense' => $totalExpense
        ]);
    }
}
