import {
  DocumentLayout,
  PrintActions,
} from "@/components/documents/DocumentLayout";
import { useDemo } from "@/context/DemoContext";
import { formatCurrency } from "@/lib/format";
import { buildCustomerLedgerRows } from "@/lib/ledgerUtils";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function SOAPreviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, getCustomerName } = useDemo();

  const customerId =
    searchParams.get("customerId") ?? state.customers[0]?.id ?? "";
  const customer = state.customers.find((c) => c.id === customerId);
  const bills = state.billingStatements.filter((b) => b.customerId === customerId);
  const payments = state.soaPayments.filter((p) => p.customerId === customerId);

  const transactions = useMemo(
    () => buildCustomerLedgerRows(bills, payments, getCustomerName),
    [bills, payments, getCustomerName],
  );

  const totalCharges = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const outstanding = totalCharges - totalPayments;

  const backPath = customerId
    ? `/soa?customerId=${encodeURIComponent(customerId)}`
    : "/soa";

  return (
    <div>
      <DocumentLayout title="STATEMENT OF ACCOUNT">
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-text-secondary">Customer:</span> {customer?.name}
          </p>
          <p>
            <span className="text-text-secondary">Period:</span> August 1–19, 2026
          </p>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-text-secondary">
              <th className="pb-2">Date</th>
              <th className="pb-2">Reference</th>
              <th className="pb-2">Description</th>
              <th className="pb-2 text-right">Debit</th>
              <th className="pb-2 text-right">Credit</th>
              <th className="pb-2 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((row, index) => (
              <tr key={`${row.ref}-${index}`} className="border-b border-border">
                <td className="py-2">{row.date}</td>
                <td>{row.ref}</td>
                <td>{row.description}</td>
                <td className="text-right">
                  {row.debit ? formatCurrency(row.debit) : "—"}
                </td>
                <td className="text-right">
                  {row.credit ? formatCurrency(row.credit) : "—"}
                </td>
                <td className="text-right">{formatCurrency(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total Charges:</span>
            <span>{formatCurrency(totalCharges)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Payments:</span>
            <span>{formatCurrency(totalPayments)}</span>
          </div>
          <div className="flex justify-between font-bold text-maroon">
            <span>Outstanding Balance:</span>
            <span>{formatCurrency(outstanding)}</span>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="text-text-secondary">Prepared By</p>
            <p className="mt-8 border-t border-border pt-2">Admin User</p>
          </div>
          <div>
            <p className="text-text-secondary">Authorized Signature</p>
            <p className="mt-8 border-t border-border pt-2">&nbsp;</p>
          </div>
        </div>
      </DocumentLayout>
      <PrintActions onBack={() => navigate(backPath)} />
    </div>
  );
}
