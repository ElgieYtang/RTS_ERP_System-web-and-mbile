<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionPresenter;
use App\Models\InventoryMovement;
use App\Models\PurchaseOrder;
use App\Models\Receiving;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ReceivingController extends Controller
{
    public function index(): JsonResponse
    {
        $rows = Receiving::query()
            ->with(['details', 'purchaseOrder.details'])
            ->orderByDesc('id')
            ->get()
            ->map(fn (Receiving $receiving) => TransactionPresenter::receiving($receiving));

        return response()->json(['data' => $rows]);
    }

    public function show(string $id): JsonResponse
    {
        $receiving = $this->findReceiving($id);

        return response()->json([
            'data' => TransactionPresenter::receiving($receiving),
        ]);
    }

    public function confirm(string $id): JsonResponse
    {
        $receiving = $this->findReceiving($id);

        if (strtoupper((string) $receiving->status) === 'COMPLETED') {
            return response()->json([
                'message' => 'Receiving is already completed.',
                'data' => TransactionPresenter::receiving($receiving),
            ]);
        }

        DB::transaction(function () use ($receiving) {
            foreach ($receiving->details as $line) {
                InventoryMovement::query()->create([
                    'branch_id' => $receiving->branch_id ?: 1,
                    'item_id' => $line->item_id,
                    'trans_id' => $receiving->id,
                    'trans_date' => $receiving->receiving_date?->toDateString() ?? now()->toDateString(),
                    'trans_type' => 'RECEIVING',
                    'in' => $line->qty,
                    'out' => 0,
                ]);
            }

            $receiving->status = 'COMPLETED';
            $receiving->save();

            if ($receiving->po_id) {
                PurchaseOrder::query()
                    ->where('id', $receiving->po_id)
                    ->update(['status' => 'COMPLETED']);
            }
        });

        return response()->json([
            'message' => 'Receiving completed successfully. Inventory has been updated.',
            'data' => TransactionPresenter::receiving($receiving->fresh(['details', 'purchaseOrder.details'])),
        ]);
    }

    private function findReceiving(string $id): Receiving
    {
        $query = Receiving::query()->with(['details', 'purchaseOrder.details']);

        if (is_numeric($id)) {
            return $query->findOrFail((int) $id);
        }

        return $query->where('receiving_no', $id)->firstOrFail();
    }
}
