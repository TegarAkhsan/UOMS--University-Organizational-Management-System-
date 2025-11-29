<?php

namespace App\Http\Controllers;

use App\Models\BudgetCode;
use Illuminate\Http\Request;

class BudgetCodeController extends Controller
{
    public function index()
    {
        return response()->json(BudgetCode::orderBy('code')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:budget_codes',
            'category' => 'required|string',
            'description' => 'required|string',
        ]);

        $budgetCode = BudgetCode::create($validated);

        return response()->json($budgetCode, 201);
    }

    public function update(Request $request, $id)
    {
        $budgetCode = BudgetCode::findOrFail($id);

        $validated = $request->validate([
            'code' => 'required|string|unique:budget_codes,code,' . $id,
            'category' => 'required|string',
            'description' => 'required|string',
        ]);

        $budgetCode->update($validated);

        return response()->json($budgetCode);
    }

    public function destroy($id)
    {
        BudgetCode::destroy($id);
        return response()->json(null, 204);
    }
}
