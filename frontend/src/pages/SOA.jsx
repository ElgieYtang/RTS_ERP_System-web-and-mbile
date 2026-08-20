import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingButton } from "@/components/ui/action-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDemo } from "@/context/DemoContext";
import { formatCurrency } from "@/lib/format";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function SOAPage() {
  const { state, getCustomerName, generateSOA } = useDemo();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCustomerId =
    searchParams.get("customerId") ?? state.customers[0]?.id ?? "cust-abc";
  const [customerId, setCustomerId] = useState(initialCustomerId);
  const [loading, setLoading] = useState(false);

  const customer = state.customers.find((c) => c.id === customerId);
  const bills = state.billingStatements.filter((b) => b.customerId === customerId);
  const payments = state.soaPayments.filter((p) => p.customerId === customerId);
  const totalCharges = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const outstanding = totalCharges - totalPayments;

  const transactions = useMemo(() => {
    const rows = [];
    let balance = 0;

    const entries = [
      ...bills.map((bill) => ({
        date: bill.billingDate,
        ref: bill.id,
        desc: bill.referenceDrId
          ? `Billing — ${bill.referenceDrId}`
          : `Billing — ${getCustomerName(bill.customerId)}`,
        debit: bill.amount,
        credit: 0,
        sortKey: bill.billingDate,
      })),
      ...payments.map((payment) => ({
        date: payment.date,
        ref: payment.reference,
        desc: payment.description,
        debit: 0,
        credit: payment.amount,
        sortKey: payment.date,
      })),
    ].sort((a, b) => String(a.sortKey).localeCompare(String(b.sortKey)));

    for (const entry of entries) {
      balance += entry.debit - entry.credit;
      rows.push({
        date: entry.date,
        ref: entry.ref,
        desc: entry.desc,
        debit: entry.debit,
        credit: entry.credit,
        balance,
      });
    }

    return rows;
  }, [bills, payments, getCustomerName]);

  const previewPath = `/soa/preview?customerId=${encodeURIComponent(customerId)}`;

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      generateSOA();
      setLoading(false);
    }, 400);
  };

  return (
    <div>
      <PageHeader
        title="Statement of Account"
        description="Generated from billing statements. Feeds into the accomplishment report."
        action={
          <div className="flex flex-wrap gap-2">
            <LoadingButton loading={loading} onClick={handleGenerate}>
              Generate SOA
            </LoadingButton>
            <Button variant="secondary" onClick={() => navigate(previewPath)}>
              Preview
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                navigate(previewPath);
                setTimeout(() => window.print(), 300);
              }}
            >
              Print
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium">Customer:</label>
        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="h-9 rounded-md border border-border-input bg-surface px-3 text-sm"
        >
          {state.customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-4">
          <p className="text-sm text-text-secondary">Period: August 1–19, 2026</p>
          <p className="mt-1 font-semibold">{customer?.name}</p>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Date</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Debit</TableHead>
            <TableHead>Credit</TableHead>
            <TableHead>Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((row, index) => (
            <TableRow key={`${row.ref}-${index}`}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.ref}</TableCell>
              <TableCell>{row.desc}</TableCell>
              <TableCell>{row.debit ? formatCurrency(row.debit) : "—"}</TableCell>
              <TableCell>{row.credit ? formatCurrency(row.credit) : "—"}</TableCell>
              <TableCell>{formatCurrency(row.balance)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-text-secondary">Total Charges</p>
            <p className="text-xl font-semibold">{formatCurrency(totalCharges)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-text-secondary">Total Payments</p>
            <p className="text-xl font-semibold">{formatCurrency(totalPayments)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-text-secondary">Outstanding Balance</p>
            <p className="text-xl font-semibold text-maroon">{formatCurrency(outstanding)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
