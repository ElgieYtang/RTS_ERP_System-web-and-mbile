<?php

namespace App\Http\Resources;

use App\Models\Billing;
use App\Models\DeliveryReceipt;
use App\Models\Outslip;
use App\Models\PurchaseOrder;
use App\Models\Quotation;
use App\Models\Receiving;
use App\Models\SetupItem;

class TransactionPresenter
{
    public static function quotation(Quotation $quotation): array
    {
        $quotation->loadMissing('details');

        return [
            'id' => $quotation->quotation_no ?: ('QTN-'.str_pad((string) $quotation->id, 5, '0', STR_PAD_LEFT)),
            'dbId' => (string) $quotation->id,
            'customerId' => (string) ($quotation->customer_id ?? ''),
            'customerName' => $quotation->customer_name,
            'date' => optional($quotation->quotation_date)->format('Y-m-d'),
            'displayDate' => optional($quotation->quotation_date)->format('F j, Y'),
            'total' => (float) $quotation->quotation_total,
            'status' => self::statusToFrontend($quotation->status),
            'preparedBy' => (string) $quotation->prepared_by,
            'approvedBy' => (string) $quotation->approved_by,
            'items' => $quotation->details->map(fn ($line) => [
                'productId' => (string) $line->item_id,
                'productName' => $line->item_name,
                'quantity' => (float) $line->qty,
                'unitPrice' => (float) $line->price,
                'amount' => (float) $line->amount,
            ])->values()->all(),
        ];
    }

    public static function purchaseOrder(PurchaseOrder $po): array
    {
        $po->loadMissing('details');

        return [
            'id' => $po->po_no ?: ('PO-'.str_pad((string) $po->id, 5, '0', STR_PAD_LEFT)),
            'dbId' => (string) $po->id,
            'referenceQuotationId' => $po->quotation_id ? (string) $po->quotation_id : null,
            'referenceQuotationNo' => null,
            'supplierId' => (string) ($po->supplier_id ?? ''),
            'supplierName' => $po->supplier_name,
            'date' => optional($po->po_date)->format('Y-m-d'),
            'displayDate' => optional($po->po_date)->format('F j, Y'),
            'total' => (float) $po->po_total,
            'status' => self::poStatusToFrontend($po->status),
            'preparedBy' => (string) $po->prepared_by,
            'approvedBy' => (string) $po->approved_by,
            'items' => $po->details->map(fn ($line) => [
                'productId' => (string) $line->item_id,
                'productName' => $line->item_name,
                'quantity' => (float) $line->qty,
                'unitPrice' => (float) $line->price,
                'amount' => (float) $line->amount,
            ])->values()->all(),
        ];
    }

    public static function receiving(Receiving $receiving): array
    {
        $receiving->loadMissing(['details', 'purchaseOrder.details']);

        $po = $receiving->purchaseOrder;
        $poLines = $po?->details ?? collect();
        $isCompleted = strtoupper((string) $receiving->status) === 'COMPLETED';

        $items = $receiving->details->map(function ($line) use ($poLines, $isCompleted) {
            $poLine = $poLines->firstWhere('item_id', $line->item_id);
            $itemName = $poLine?->item_name
                ?? SetupItem::query()->find($line->item_id)?->item_name
                ?? 'Item '.$line->item_id;
            $ordered = (float) ($poLine?->qty ?? $line->qty);

            return [
                'productId' => (string) $line->item_id,
                'productName' => $itemName,
                'quantity' => (float) $line->qty,
                'unitPrice' => (float) ($poLine?->price ?? 0),
                'ordered' => $ordered,
                'received' => $isCompleted ? $ordered : 0,
                'remaining' => $isCompleted ? 0 : $ordered,
            ];
        })->values()->all();

        return [
            'id' => $receiving->receiving_no ?: ('RCV-'.str_pad((string) $receiving->id, 5, '0', STR_PAD_LEFT)),
            'dbId' => (string) $receiving->id,
            'purchaseOrderId' => $po?->po_no ?? (string) $receiving->po_id,
            'purchaseOrderDbId' => (string) $receiving->po_id,
            'supplierId' => (string) ($po?->supplier_id ?? ''),
            'supplierName' => $po?->supplier_name ?? '',
            'branchId' => (string) $receiving->branch_id,
            'date' => optional($receiving->receiving_date)->format('Y-m-d'),
            'displayDate' => optional($receiving->receiving_date)->format('F j, Y'),
            'remarks' => $receiving->remarks,
            'status' => $isCompleted ? 'completed' : 'pending',
            'items' => $items,
        ];
    }

    public static function outslip(Outslip $outslip): array
    {
        $outslip->loadMissing('details');

        return [
            'id' => $outslip->outslip_no ?: ('OS-'.str_pad((string) $outslip->id, 5, '0', STR_PAD_LEFT)),
            'dbId' => (string) $outslip->id,
            'customerId' => (string) ($outslip->customer_id ?? ''),
            'customerName' => $outslip->customer_name,
            'receivingId' => $outslip->receiving_id ? (string) $outslip->receiving_id : null,
            'branchId' => (string) $outslip->branch_id,
            'date' => optional($outslip->outslip_date)->format('Y-m-d'),
            'displayDate' => optional($outslip->outslip_date)->format('F j, Y'),
            'status' => self::outslipStatusToFrontend($outslip->status),
            'items' => $outslip->details->map(fn ($line) => [
                'productId' => (string) $line->item_id,
                'productName' => $line->item_name,
                'quantity' => (float) $line->qty,
                'unitPrice' => (float) $line->price,
                'amount' => (float) $line->amount,
            ])->values()->all(),
        ];
    }

    public static function deliveryReceipt(DeliveryReceipt $delivery): array
    {
        $delivery->loadMissing(['details', 'outslip']);

        return [
            'id' => $delivery->dr_no ?: ('DR-'.str_pad((string) $delivery->id, 5, '0', STR_PAD_LEFT)),
            'dbId' => (string) $delivery->id,
            'customerId' => (string) ($delivery->customer_id ?? ''),
            'customerName' => $delivery->customer_name,
            'referenceOutslipId' => $delivery->outslip?->outslip_no
                ?? ($delivery->outslip_id ? (string) $delivery->outslip_id : null),
            'referenceOutslipDbId' => (string) $delivery->outslip_id,
            'date' => optional($delivery->dr_date)->format('Y-m-d'),
            'displayDate' => optional($delivery->dr_date)->format('F j, Y'),
            'total' => (float) $delivery->dr_total,
            'status' => self::deliveryStatusToFrontend($delivery->status),
            'items' => $delivery->details->map(fn ($line) => [
                'productId' => (string) $line->item_id,
                'productName' => $line->item_name,
                'quantity' => (float) $line->qty,
                'unitPrice' => (float) $line->price,
                'amount' => (float) $line->amount,
            ])->values()->all(),
        ];
    }

    public static function billing(Billing $billing): array
    {
        $billing->loadMissing(['payments', 'delivery']);

        $paid = (float) ($billing->paid_amount ?? 0);
        $total = (float) $billing->billing_total;
        $paymentStatus = 'unpaid';
        if ($paid >= $total && $total > 0) {
            $paymentStatus = 'paid';
        } elseif ($paid > 0) {
            $paymentStatus = 'partially_paid';
        }

        return [
            'id' => $billing->billing_no ?: ('BS-'.str_pad((string) $billing->id, 5, '0', STR_PAD_LEFT)),
            'dbId' => (string) $billing->id,
            'customerId' => (string) ($billing->customer_id ?? ''),
            'customerName' => $billing->customer_name,
            'referenceDrId' => $billing->delivery?->dr_no
                ?? ($billing->delivery_id ? (string) $billing->delivery_id : null),
            'referenceDrDbId' => (string) $billing->delivery_id,
            'billingDate' => optional($billing->billing_date)->format('Y-m-d'),
            'displayDate' => optional($billing->billing_date)->format('F j, Y'),
            'amount' => $total,
            'paidAmount' => $paid,
            'paymentStatus' => $paymentStatus,
            'status' => strtoupper((string) $billing->status) === 'INACTIVE' ? 'inactive' : 'active',
            'payments' => $billing->payments->map(fn ($payment) => [
                'id' => $payment->payment_no ?: ('PAY-'.str_pad((string) $payment->id, 5, '0', STR_PAD_LEFT)),
                'date' => optional($payment->payment_date)->format('Y-m-d'),
                'amount' => (float) $payment->amount,
                'reference' => $payment->reference,
                'remarks' => $payment->remarks,
            ])->values()->all(),
        ];
    }

    public static function outslipStatusToFrontend(?string $status): string
    {
        return match (strtoupper((string) $status)) {
            'APPROVED' => 'approved',
            'FOR_DISPATCH', 'RELEASED' => 'for_dispatch',
            'CANCELLED', 'INACTIVE' => 'cancelled',
            default => 'pending',
        };
    }

    public static function deliveryStatusToFrontend(?string $status): string
    {
        return match (strtoupper((string) $status)) {
            'OUT FOR DELIVERY', 'OUT_FOR_DELIVERY' => 'out_for_delivery',
            'DELIVERED' => 'delivered',
            'INACTIVE', 'CANCELLED' => 'cancelled',
            'PENDING', 'ACTIVE' => 'active',
            default => 'active',
        };
    }

    public static function statusToFrontend(?string $status): string
    {
        return match (strtoupper((string) $status)) {
            'ACTIVE', 'APPROVED' => 'approved',
            'INACTIVE', 'CANCELLED' => 'cancelled',
            'COMPLETED' => 'approved',
            'REJECTED' => 'rejected',
            'DRAFT' => 'draft',
            default => 'pending',
        };
    }

    public static function poStatusToFrontend(?string $status): string
    {
        return match (strtoupper((string) $status)) {
            'ACTIVE', 'APPROVED' => 'approved',
            'INACTIVE', 'CANCELLED' => 'cancelled',
            'COMPLETED', 'FULLY_RECEIVED' => 'fully_received',
            'PARTIAL' => 'partial',
            default => 'pending',
        };
    }

    public static function statusToDb(?string $status): string
    {
        return match (strtolower((string) $status)) {
            'approved' => 'APPROVED',
            'cancelled', 'inactive' => 'CANCELLED',
            'rejected' => 'REJECTED',
            'draft' => 'DRAFT',
            'completed', 'fully_received' => 'COMPLETED',
            'partial' => 'PARTIAL',
            'for_dispatch' => 'FOR_DISPATCH',
            'out_for_delivery' => 'OUT FOR DELIVERY',
            'delivered' => 'DELIVERED',
            'active' => 'ACTIVE',
            default => 'PENDING',
        };
    }
}
