import { MobileDetailField, MobileDetailShell, MobileStickyActions } from '@/components/layout/MobileDetailShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDemo } from '@/context/DemoContext'
import { useTransactions } from '@/context/TransactionContext'
import { formatCurrency } from '@/lib/format'
import { getStatusDisplay } from '@/lib/status'
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

export function OutslipDetailPage() {
  const { id } = useParams()
  const { showToast } = useDemo()
  const {
    outslips,
    loading,
    approveOutslip,
    forDispatchOutslip,
    createDeliveryFromOutslip,
  } = useTransactions()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  const outslip = outslips.find((o) => o.id === id)
  if (!loading && !outslip) return <Navigate to="/outslip" replace />
  if (!outslip) return <p className="p-4 text-sm text-text-secondary">Loading…</p>

  const st = getStatusDisplay(outslip.status === 'released' ? 'for_dispatch' : outslip.status)

  const handleApprove = async () => {
    setBusy(true)
    try {
      await approveOutslip(outslip.id)
      showToast('success', 'Outslip approved.')
    } catch (caught) {
      showToast('error', caught?.message ?? 'Could not approve.')
    } finally {
      setBusy(false)
    }
  }

  const handleDispatch = async () => {
    setBusy(true)
    try {
      await forDispatchOutslip(outslip.id)
      showToast('success', 'Outslip marked for dispatch.')
    } catch (caught) {
      showToast('error', caught?.message ?? 'Could not dispatch.')
    } finally {
      setBusy(false)
    }
  }

  const handleCreateDR = async () => {
    setBusy(true)
    try {
      const drId = await createDeliveryFromOutslip(outslip.id)
      showToast('success', 'Delivery Receipt created.')
      if (drId) navigate(`/delivery-receipt/${drId}`)
    } catch (caught) {
      showToast('error', caught?.message ?? 'Could not create DR.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <MobileDetailShell
        title={outslip.id}
        backTo="/outslip"
        actions={
          <MobileStickyActions>
            {outslip.status === 'pending' ? (
              <Button className="w-full" disabled={busy} onClick={handleApprove}>
                Approve
              </Button>
            ) : null}
            {outslip.status === 'approved' ? (
              <Button className="w-full" disabled={busy} onClick={handleDispatch}>
                Mark For Dispatch
              </Button>
            ) : null}
            {outslip.status === 'for_dispatch' || outslip.status === 'released' ? (
              <Button className="w-full" disabled={busy} onClick={handleCreateDR}>
                Create Delivery Receipt
              </Button>
            ) : null}
          </MobileStickyActions>
        }
      >
        <div className="mb-4">
          <Badge variant={st.variant}>{st.label}</Badge>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <MobileDetailField label="Customer" value={outslip.customerName || outslip.customerId} />
          <MobileDetailField
            label="Reference"
            value={outslip.receivingId ? `RCV #${outslip.receivingId}` : '—'}
          />
          <MobileDetailField label="Date" value={outslip.displayDate || outslip.date} />
          <MobileDetailField
            label="Items"
            value={`${(outslip.items ?? []).reduce((s, i) => s + i.quantity, 0)} units`}
          />
        </div>
        <h2 className="mb-2 text-sm font-semibold text-text-primary">Line Items</h2>
        <div className="space-y-2">
          {(outslip.items ?? []).map((item) => (
            <div key={item.productId} className="rounded-lg border border-border bg-surface p-3 text-sm">
              <p className="font-medium">{item.productName}</p>
              <p className="mt-1 text-text-secondary">
                {item.quantity} × {formatCurrency(item.unitPrice)}
              </p>
            </div>
          ))}
        </div>
      </MobileDetailShell>
      <div className="hidden md:block">
        <Navigate to="/outslip" replace />
      </div>
    </>
  )
}
