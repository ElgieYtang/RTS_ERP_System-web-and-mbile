import { StatusTabs } from '@/components/layout/Breadcrumbs'
import { PageHeader } from '@/components/layout/PageHeader'
import { TABLE_ACTIONS_CELL_CLASS, TABLE_ACTIONS_HEAD_CLASS, TableActions } from '@/components/ui/action-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Modal } from '@/components/ui/modal'
import { ResponsiveTable } from '@/components/ui/responsive-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableLink,
  TableRow,
} from '@/components/ui/table'
import { EmptyState, TableFilters } from '@/components/ui/table-filters'
import { useDemo } from '@/context/DemoContext'
import { useTransactions } from '@/context/TransactionContext'
import { useIsMobile } from '@/hooks/useIsMobile'
import { filterByDateRange } from '@/lib/dateFilter'
import { formatCurrency } from '@/lib/format'
import { getStatusDisplay } from '@/lib/status'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function DeliveryReceiptsPage() {
  const { showToast } = useDemo()
  const {
    deliveryReceipts,
    loading,
    markDeliveryOutForDelivery,
    markDeliveryDelivered,
    createBillingFromDelivery,
  } = useTransactions()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusTab, setStatusTab] = useState('all')
  const [viewId, setViewId] = useState(null)
  const [deliverId, setDeliverId] = useState(null)
  const [busy, setBusy] = useState(false)

  const counts = useMemo(
    () => ({
      active: deliveryReceipts.filter((d) => d.status === 'active').length,
      out_for_delivery: deliveryReceipts.filter((d) => d.status === 'out_for_delivery').length,
      delivered: deliveryReceipts.filter((d) => d.status === 'delivered').length,
      all: deliveryReceipts.length,
    }),
    [deliveryReceipts],
  )

  const filtered = useMemo(() => {
    let list = [...deliveryReceipts]
    const q = search.toLowerCase()
    if (q) {
      list = list.filter(
        (d) =>
          d.id.toLowerCase().includes(q) ||
          (d.customerName ?? '').toLowerCase().includes(q) ||
          (d.referenceOutslipId ?? '').toLowerCase().includes(q),
      )
    }
    if (statusTab !== 'all') {
      list = list.filter((d) => d.status === statusTab)
    }
    list = filterByDateRange(list, dateFrom, dateTo, 'date')
    const order = ['active', 'out_for_delivery', 'delivered']
    list.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status))
    return list
  }, [deliveryReceipts, search, statusTab, dateFrom, dateTo])

  const viewDr = viewId ? deliveryReceipts.find((d) => d.id === viewId) : null

  const openDetail = (id) => {
    if (isMobile) navigate(`/delivery-receipt/${id}`)
    else setViewId(id)
  }

  const handleOutForDelivery = async (id) => {
    setBusy(true)
    try {
      await markDeliveryOutForDelivery(id)
      showToast('success', 'Delivery marked as out for delivery.')
    } catch (caught) {
      showToast('error', caught?.message ?? 'Could not update delivery.')
    } finally {
      setBusy(false)
    }
  }

  const handleDelivered = async (id) => {
    setBusy(true)
    try {
      await markDeliveryDelivered(id)
      showToast('success', 'Delivery marked as completed.')
      setDeliverId(null)
    } catch (caught) {
      showToast('error', caught?.message ?? 'Could not mark delivered.')
    } finally {
      setBusy(false)
    }
  }

  const handleCreateBilling = async (id) => {
    setBusy(true)
    try {
      const bill = await createBillingFromDelivery(id)
      showToast('success', `Billing ${bill?.id ?? ''} created.`)
      navigate('/billing')
    } catch (caught) {
      showToast('error', caught?.message ?? 'Could not create billing.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Delivery Receipt"
        description="Track and confirm customer deliveries."
        breadcrumbs={['Transaction', 'Delivery Receipt']}
      />

      {loading ? (
        <p className="mb-4 text-sm text-text-secondary">Loading delivery receipts…</p>
      ) : null}

      <StatusTabs
        active={statusTab}
        onChange={setStatusTab}
        tabs={[
          { key: 'all', label: 'All', count: counts.all },
          { key: 'active', label: 'Active', count: counts.active },
          { key: 'out_for_delivery', label: 'Out for Delivery', count: counts.out_for_delivery },
          { key: 'delivered', label: 'Delivered', count: counts.delivered },
        ]}
      />

      <TableFilters
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search delivery receipts..."
        showDateRange
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      <ResponsiveTable
        emptyMessage="No delivery receipts found."
        mobileItems={filtered.map((d) => {
          const st = getStatusDisplay(d.status)
          return {
            id: d.id,
            title: d.id,
            subtitle: d.customerName || d.customerId,
            badge: { label: st.label, variant: st.variant },
            fields: [
              { label: 'Date', value: d.displayDate || d.date },
              { label: 'Total', value: formatCurrency(d.total ?? 0) },
            ],
            onClick: () => openDetail(d.id),
          }
        })}
        desktop={
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>DR No.</TableHead>
                <TableHead>Reference Outslip</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className={TABLE_ACTIONS_HEAD_CLASS}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7}>
                    <EmptyState />
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((d) => {
                  const st = getStatusDisplay(d.status)
                  return (
                    <TableRow key={d.id}>
                      <TableCell>
                        <TableLink onClick={() => openDetail(d.id)}>{d.id}</TableLink>
                      </TableCell>
                      <TableCell>{d.referenceOutslipId ?? '—'}</TableCell>
                      <TableCell>{d.customerName || d.customerId}</TableCell>
                      <TableCell>{d.displayDate || d.date}</TableCell>
                      <TableCell>{formatCurrency(d.total ?? 0)}</TableCell>
                      <TableCell>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </TableCell>
                      <TableCell className={TABLE_ACTIONS_CELL_CLASS}>
                        <TableActions
                          onPrint={() => {
                            navigate(`/delivery-receipt/${d.id}/preview`)
                            setTimeout(() => window.print(), 300)
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        }
      />

      <Modal open={!!viewDr} onClose={() => setViewId(null)} title="Delivery Receipt Details" size="md">
        {viewDr ? (
          <div className="space-y-2 text-sm">
            <p>
              <strong>{viewDr.id}</strong>
            </p>
            <p>Customer: {viewDr.customerName || viewDr.customerId}</p>
            <p>Reference Outslip: {viewDr.referenceOutslipId}</p>
            <p>Total: {formatCurrency(viewDr.total ?? 0)}</p>
            {viewDr.status === 'active' ? (
              <Button disabled={busy} onClick={() => handleOutForDelivery(viewDr.id)}>
                Mark Out for Delivery
              </Button>
            ) : null}
            {viewDr.status === 'out_for_delivery' ? (
              <Button disabled={busy} onClick={() => setDeliverId(viewDr.id)}>
                Mark as Delivered
              </Button>
            ) : null}
            {viewDr.status === 'delivered' ? (
              <Button disabled={busy} onClick={() => handleCreateBilling(viewDr.id)}>
                Create Billing
              </Button>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={!!deliverId}
        onClose={() => setDeliverId(null)}
        title="Mark as Delivered"
        message="Mark this delivery as completed?"
        confirmLabel="Confirm"
        onConfirm={() => {
          if (deliverId) handleDelivered(deliverId)
        }}
      />
    </div>
  )
}
