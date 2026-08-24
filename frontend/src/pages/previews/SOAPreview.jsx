import {
  DocumentLayout,
  PrintActions,
} from '@/components/documents/DocumentLayout'
import { useSetupResource } from '@/hooks/useSetupResource'
import { formatCurrency } from '@/lib/format'
import { fetchSoa } from '@/lib/reportsApi'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export function SOAPreviewPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { rows: customers } = useSetupResource('customers')
  const customerId = searchParams.get('customerId') ?? customers[0]?.id ?? ''
  const [account, setAccount] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!customerId) return
    let cancelled = false
    fetchSoa({ customerId })
      .then((data) => {
        if (!cancelled) setAccount(data)
      })
      .catch((caught) => {
        if (!cancelled) setError(caught?.message ?? 'Could not load SOA.')
      })
    return () => {
      cancelled = true
    }
  }, [customerId])

  const backPath = customerId
    ? `/soa?customerId=${encodeURIComponent(customerId)}`
    : '/soa'

  if (error) {
    return <p className="text-text-secondary">{error}</p>
  }

  if (!account) {
    return <p className="text-text-secondary">Loading SOA…</p>
  }

  const totals = account.totals ?? { totalDebit: 0, totalCredit: 0, outstanding: 0 }

  return (
    <div>
      <DocumentLayout title="STATEMENT OF ACCOUNT">
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-text-secondary">Customer:</span> {account.customerName}
          </p>
          {account.customerAddress ? (
            <p>
              <span className="text-text-secondary">Address:</span> {account.customerAddress}
            </p>
          ) : null}
          <p>
            <span className="text-text-secondary">Period:</span> {account.periodLabel}
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
            {(account.rows ?? []).map((row, index) => (
              <tr key={`${row.ref}-${index}`} className="border-b border-border">
                <td className="py-2">{row.date}</td>
                <td>{row.ref}</td>
                <td>{row.description}</td>
                <td className="text-right">{row.debit ? formatCurrency(row.debit) : '—'}</td>
                <td className="text-right">{row.credit ? formatCurrency(row.credit) : '—'}</td>
                <td className="text-right">{formatCurrency(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total Charges:</span>
            <span>{formatCurrency(totals.totalDebit)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Payments:</span>
            <span>{formatCurrency(totals.totalCredit)}</span>
          </div>
          <div className="flex justify-between font-bold text-maroon">
            <span>Outstanding Balance:</span>
            <span>{formatCurrency(totals.outstanding)}</span>
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
  )
}
