import { MobileDetailField, MobileDetailShell, MobileStickyActions } from '@/components/layout/MobileDetailShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDemo } from '@/context/DemoContext'
import { useTransactions } from '@/context/TransactionContext'
import { formatCurrency } from '@/lib/format'
import { getStatusDisplay } from '@/lib/status'
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

export function DeliveryReceiptDetailPage() {
  const { id } = useParams()
  const { showToast } = useDemo()
  const {
    deliveryReceipts,
    loading,
    markDeliveryOutForDelivery,
    markDeliveryDelivered,
    createBillingFromDelivery,
  } = useTransactions()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  const dr = deliveryReceipts.find((d) => d.id === id)
  if (!loading && !dr) return <Navigate to="/delivery-receipt" replace />
  if (!dr) return <p className="p-4 text-sm text-text-secondary">Loading…</p>

  const st = getStatusDisplay(dr.status)

  const handleOutForDelivery = async () => {
    setBusy(true)
    try {
      await markDeliveryOutForDelivery(dr.id)
      showToast('success', 'Delivery marked as out for delivery.')
    } catch (caught) {
      showToast('error', caught?.message ?? 'Could not update.')
    } finally {
      setBusy(false)
    }
  }

  const handleDelivered = async () => {
    setBusy(true)
    try {
      await markDeliveryDelivered(dr.id)
      showToast('success', 'Delivery marked as completed.')
    } catch (caught) {
      showToast('error', caught?.message ?? 'Could not mark delivered.')
    } finally {
      setBusy(false)
    }
  }

  const handleCreateBilling = async () => {
    setBusy(true)
    try {
      const bill = await createBillingFromDelivery(dr.id)
      showToast('success', `Billing ${bill?.id ?? ''} created.`)
      navigate('/billing')
    } catch (caught) {
      showToast('error', caught?.message ?? 'Could not create billing.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <MobileDetailShell
        title={dr.id}
        backTo="/delivery-receipt"
        actions={
          <MobileStickyActions>
            {dr.status === 'active' ? (
              <Button className="w-full" disabled={busy} onClick={handleOutForDelivery}>
                Mark Out for Delivery
              </Button>
            ) : null}
            {dr.status === 'out_for_delivery' ? (
              <Button className="w-full" disabled={busy} onClick={handleDelivered}>
                Mark Delivered
              </Button>
            ) : null}
            {dr.status === 'delivered' ? (
              <Button className="w-full" disabled={busy} onClick={handleCreateBilling}>
                Create Billing
              </Button>
            ) : null}
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate(`/delivery-receipt/${dr.id}/preview`)}
            >
              Preview / Print
            </Button>
          </MobileStickyActions>
        }
      >
        <div className="mb-4">
          <Badge variant={st.variant}>{st.label}</Badge>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <MobileDetailField label="Customer" value={dr.customerName || dr.customerId} />
          <MobileDetailField label="Reference OS" value={dr.referenceOutslipId} />
          <MobileDetailField label="Delivery Date" value={dr.displayDate || dr.date} />
          <MobileDetailField label="Total" value={formatCurrency(dr.total ?? 0)} />
        </div>
      </MobileDetailShell>
      <div className="hidden md:block">
        <Navigate to="/delivery-receipt" replace />
      </div>
    </>
  )
}
