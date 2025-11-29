<?php

namespace App\Http\Controllers;

use App\Models\CashCollection;
use App\Models\CashPayment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CashController extends Controller
{
    public function index()
    {
        return CashCollection::with('creator')->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'amount' => 'nullable|numeric',
            'created_by' => 'required|exists:users,id'
        ]);

        $collection = CashCollection::create($request->all());
        return response()->json($collection, 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string',
            'amount' => 'nullable|numeric',
        ]);

        $collection = CashCollection::findOrFail($id);
        $collection->update($request->all());

        return response()->json($collection);
    }

    public function destroy($id)
    {
        $collection = CashCollection::findOrFail($id);
        // Payments should cascade delete if foreign key is set up, otherwise:
        CashPayment::where('collection_id', $id)->delete();
        $collection->delete();

        return response()->json(['message' => 'Collection deleted']);
    }

    public function getPayments($collectionId)
    {
        // Get all staff/members (excluding admins if needed, but for now all users)
        // Adjust filter as per requirements (e.g., only 'staff' or 'member' roles)
        $users = User::whereNotIn('role', ['admin', 'superadmin'])->get();

        $payments = CashPayment::where('collection_id', $collectionId)->get();

        // Structure data: User -> [Period -> PaymentStatus]
        $data = [];
        foreach ($users as $user) {
            $userPayments = $payments->where('user_id', $user->id);
            $paymentMap = [];
            foreach ($userPayments as $p) {
                $paymentMap[$p->period] = [
                    'is_paid' => $p->is_paid,
                    'paid_at' => $p->paid_at
                ];
            }

            $data[] = [
                'user' => $user,
                'payments' => $paymentMap
            ];
        }

        return response()->json($data);
    }

    public function togglePayment(Request $request)
    {
        $request->validate([
            'collection_id' => 'required|exists:cash_collections,id',
            'user_id' => 'required|exists:users,id',
            'period' => 'required|string',
            'is_paid' => 'required|boolean'
        ]);

        $payment = CashPayment::updateOrCreate(
            [
                'collection_id' => $request->collection_id,
                'user_id' => $request->user_id,
                'period' => $request->period
            ],
            [
                'is_paid' => $request->is_paid,
                'paid_at' => $request->is_paid ? now() : null
            ]
        );
        return response()->json($payment);
    }

    public function summary()
    {
        $total = DB::table('cash_payments')
            ->join('cash_collections', 'cash_payments.collection_id', '=', 'cash_collections.id')
            ->where('cash_payments.is_paid', true)
            ->sum('cash_collections.amount');

        return response()->json(['total_collected' => $total]);
    }
}
