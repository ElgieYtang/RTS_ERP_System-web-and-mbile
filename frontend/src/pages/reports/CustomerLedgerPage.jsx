import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DateRangeFilter } from "@/components/ui/table-filters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDemo } from "@/context/DemoContext";
import { isWithinDateRange } from "@/lib/dateFilter";
import { formatCurrency } from "@/lib/format";
import { buildCustomerLedgerRows, ledgerTotals } from "@/lib/ledgerUtils";
import { Printer } from "lucide-react";
import { useMemo, useState } from "react";

export function CustomerLedgerPage() {
  const { state, getCustomerName } = useDemo();
  const [customerId, setCustomerId] = useState(state.customers[0]?.id ?? "");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const customer = state.customers.find((c) => c.id === customerId);
  const bills = state.billingStatements.filter((b) => b.customerId === customerId);
  const payments = state.soaPayments.filter((p) => p.customerId === customerId);

  const transactions = useMemo(() => {
    const rows = buildCustomerLedgerRows(bills, payments, getCustomerName);
    if (!dateFrom && !dateTo) return rows;
    return rows.filter((row) => isWithinDateRange(row.date, dateFrom, dateTo));
  }, [bills, payments, getCustomerName, dateFrom, dateTo]);

  const { totalDebit, totalCredit, outstanding } = ledgerTotals(transactions);

  return (
    <div>
      <PageHeader
        title="Customer Ledger"
        description="Running account per customer — charges, payments, and balance."
        action={
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Customer</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="h-9 min-w-[220px] rounded-md border border-border-input bg-surface px-3 text-sm"
          >
            {state.customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <DateRangeFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />
      </div>

      <Card className="mb-6">
        <CardContent className="pt-4">
          <p className="text-sm text-text-secondary">Account for</p>
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
              <TableCell>{row.description}</TableCell>
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
            <p className="text-xl font-semibold">{formatCurrency(totalDebit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-text-secondary">Total Payments</p>
            <p className="text-xl font-semibold">{formatCurrency(totalCredit)}</p>
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
