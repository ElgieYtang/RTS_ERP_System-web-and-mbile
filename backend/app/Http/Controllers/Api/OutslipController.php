<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionPresenter;
use App\Models\InventoryMovement;
use App\Models\Outslip;
use App\Models\Receiving;
use App\Models\SetupCustomer;
use App\Models\SetupItem;
use App\Support\DocumentNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OutslipController extends Controller
{
    public function index(): JsonResponse
    {
        $rows = Outslip::query()
            ->with('details')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Outslip $outslip) => TransactionPresenter::outslip($outslip));

        return response()->json(['data' => $rows]);
    }

    public function show(string $id): JsonResponse
    {
        return response()->json([
            'data' => TransactionPresenter::outslip($this->findOutslip($id)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'customerId' => ['required', 'integer', 'exists:setup_customer,id'],
            'receivingId' => ['nullable', 'integer', 'exists:receiving_main,id'],
            'branchId' => ['nullable', 'integer'],
            'date' => ['nullable', 'date'],
            'items' => ['nullable', 'array', 'min:1'],
            'items.*.productId' => ['required_with:items', 'integer', 'exists:setup_items,id'],
            'items.*.quantity' => ['required_with:items', 'numeric', 'min:0.01'],
            'items.*.unitPrice' => ['nullable', 'numeric', 'min:0'],
        ]);

        $user = $request->attributes->get('auth_user');
        $customer = SetupCustomer::query()->findOrFail($payload['customerId']);
        $lines = $this->resolveLines($payload);

        if ($lines === []) {
            throw ValidationException::withMessages([
                'items' => 'At least one line item is required.',
            ]);
        }

        $outslip = DB::transaction(function () use ($payload, $customer, $user, $lines) {
            $latest = Outslip::query()->orderByDesc('id')->value('outslip_no');

            $outslip = Outslip::query()->create([
                'customer_id' => $customer->id,
                'customer_name' => $customer->name,
                'outslip_no' => DocumentNumber::next('OS-', $latest),
                'outslip_date' => $payload['date'] ?? now()->toDateString(),
                'receiving_id' => (int) ($payload['receivingId'] ?? 0),
                'branch_id' => (int) ($payload['branchId'] ?? 1),
                'prepared_by' => $user?->id ?? 0,
                'status' => 'PENDING',
            ]);

            foreach ($lines as $line) {
                $outslip->details()->create($line);
            }

            return $outslip->load('details');
        });

        return response()->json([
            'message' => 'Outslip created successfully.',
            'data' => TransactionPresenter::outslip($outslip),
        ], 201);
    }

    public function approve(Request $request, string $id): JsonResponse
    {
        $outslip = $this->findOutslip($id);

        if (strtoupper((string) $outslip->status) !== 'PENDING') {
            return response()->json(['message' => 'Only pending outslips can be approved.'], 422);
        }

        $user = $request->attributes->get('auth_user');
        $outslip->status = 'APPROVED';
        $outslip->prepared_by = $outslip->prepared_by ?: ($user?->id ?? 0);
        $outslip->save();

        return response()->json([
            'message' => 'Outslip approved.',
            'data' => TransactionPresenter::outslip($outslip->fresh('details')),
        ]);
    }

    public function dispatch(string $id): JsonResponse
    {
        $outslip = $this->findOutslip($id);

        if (strtoupper((string) $outslip->status) !== 'APPROVED') {
            return response()->json(['message' => 'Only approved outslips can be marked for dispatch.'], 422);
        }

        DB::transaction(function () use ($outslip) {
            foreach ($outslip->details as $line) {
                InventoryMovement::query()->create([
                    'branch_id' => $outslip->branch_id ?: 1,
                    'item_id' => $line->item_id,
                    'trans_id' => $outslip->id,
                    'trans_date' => $outslip->outslip_date?->toDateString() ?? now()->toDateString(),
                    'trans_type' => 'OUTSLIP',
                    'in' => 0,
                    'out' => $line->qty,
                ]);
            }

            $outslip->status = 'FOR_DISPATCH';
            $outslip->save();
        });

        return response()->json([
            'message' => 'Outslip marked for dispatch. Inventory has been updated.',
            'data' => TransactionPresenter::outslip($outslip->fresh('details')),
        ]);
    }

    private function resolveLines(array $payload): array
    {
        if (! empty($payload['items'])) {
            return $this->buildLines($payload['items']);
        }

        $receivingId = (int) ($payload['receivingId'] ?? 0);
        if (! $receivingId) {
            return [];
        }

        $receiving = Receiving::query()
            ->with(['details', 'purchaseOrder.details'])
            ->findOrFail($receivingId);

        if (strtoupper((string) $receiving->status) !== 'COMPLETED') {
            throw ValidationException::withMessages([
                'receivingId' => 'Only completed receivings can create an outslip.',
            ]);
        }

        $poLines = $receiving->purchaseOrder?->details ?? collect();

        return $receiving->details->map(function ($line) use ($poLines) {
            $poLine = $poLines->firstWhere('item_id', $line->item_id);
            $item = SetupItem::query()->find($line->item_id);
            $qty = (float) $line->qty;
            $price = (float) ($poLine?->price ?? 0);

            return [
                'item_id' => $line->item_id,
                'item_name' => $poLine?->item_name ?? $item?->item_name ?? 'Item '.$line->item_id,
                'qty' => $qty,
                'price' => $price,
                'amount' => $qty * $price,
            ];
        })->values()->all();
    }

    private function buildLines(array $items): array
    {
        $lines = [];

        foreach ($items as $item) {
            $setupItem = SetupItem::query()->findOrFail((int) $item['productId']);
            $qty = (float) $item['quantity'];
            $price = (float) ($item['unitPrice'] ?? 0);

            $lines[] = [
                'item_id' => $setupItem->id,
                'item_name' => $setupItem->item_name,
                'qty' => $qty,
                'price' => $price,
                'amount' => $qty * $price,
            ];
        }

        return $lines;
    }

    private function findOutslip(string $id): Outslip
    {
        $query = Outslip::query()->with('details');

        if (is_numeric($id)) {
            return $query->findOrFail((int) $id);
        }

        return $query->where('outslip_no', $id)->firstOrFail();
    }
}
