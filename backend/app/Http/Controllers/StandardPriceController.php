<?php

namespace App\Http\Controllers;

use App\Models\StandardPrice;
use Illuminate\Http\Request;

class StandardPriceController extends Controller
{
    public function index()
    {
        return response()->json(StandardPrice::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_name' => 'required|string',
            'category' => 'required|string',
            'price' => 'required|numeric',
            'unit' => 'required|string',
        ]);

        $standardPrice = StandardPrice::create($validated);

        return response()->json($standardPrice, 201);
    }

    public function update(Request $request, $id)
    {
        $standardPrice = StandardPrice::findOrFail($id);

        $validated = $request->validate([
            'item_name' => 'required|string',
            'category' => 'required|string',
            'price' => 'required|numeric',
            'unit' => 'required|string',
        ]);

        $standardPrice->update($validated);

        return response()->json($standardPrice);
    }

    public function destroy($id)
    {
        StandardPrice::destroy($id);
        return response()->json(null, 204);
    }
}
