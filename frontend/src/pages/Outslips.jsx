import { StatusTabs } from '@/components/layout/Breadcrumbs'
import { PageHeader } from '@/components/layout/PageHeader'
import { TABLE_ACTIONS_CELL_CLASS, TABLE_ACTIONS_HEAD_CLASS, TableActions } from '@/components/ui/action-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { FormField } from '@/components/ui/input'
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
import { useSetupResource } from '@/hooks/useSetupResource'
import { filterByDateRange } from '@/lib/dateFilter'
import { getStatusDisplay } from '@/lib/status'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const STATUS_ORDER = ['pending', 'approved', 'for_dispatch', 'released']

export function OutslipsPage() {
  const { showToast } = useDemo()
  const {
    outslips,
    receivings,
    loading,
    createOutslip,
    approveOutslip,
    forDispatchOutslip,
    createDeliveryFromOutslip,
  } = useTransactions()
  const { rows: customers } = useSetupResource('customers')
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [searchParams] = useSearchParams()
  const receivingFromUrl = searchParams.get('receiving')

  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusTab, setStatusTab] = useState('all')
  const [viewId, setViewId] = useState(null)
  const [dispatchId, setDispatchId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [createOpen, setCreateOpen] = useState(Boolean(receivingFromUrl))
  const [createForm, setCreateForm] = useState({
    customerId: '',
    receivingId: receivingFromUrl ?? '',
  })

  const linkedReceiving = createForm.receivingId
    ? receivings.find(
        (r) => r.id === createForm.receivingId || r.dbId === String(createForm.receivingId),
      )
    : null

  const counts = useMemo(
    () => ({
      pending: outslips.filter((o) => o.status === 'pending').length,
      approved: outslips.filter((o) => o.status === 'approved').length,
      for_dispatch: outslips.filter((o) => o.status === 'for_dispatch' || o.status === 'released')
        .length,
      all: outslips.length,
    }),
    [outslips],
  )

  const filtered = useMemo(() => {
    let list = [...outslips]
    const q = search.toLowerCase()
    if (q) {
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          (o.customerName ?? '').toLowerCase().includes(q),
      )
    }
    if (statusTab !== 'all') {
      if (statusTab === 'for_dispatch') {
        list = list.filter((o) => o.status === 'for_dispatch' || o.status === 'released')
      } else {
        list = list.filter((o) => o.status === statusTab)
      }
    }
    list = filterByDateRange(list, dateFrom, dateTo, 'date')
    list.sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))
    return list
  }, [outslips, search, statusTab, dateFrom, dateTo])

  const viewOs = viewId ? outslips.find((o) => o.id === viewId) : null
  const completedReceivings = receivings.filter((r) => r.status === 'completed')

  const openDetail = (id) => {
    if (isMobile) navigate(`/outslip/${id}`)
    else setViewId(id)
  }

  const handleCreate = async () => {
    if (!createForm.customerId) {
      showToast('error', 'Select a customer.')
      return
    }
    if (!createForm.receivingId && !linkedReceiving) {
      showToast('error', 'Select a completed receiving to create an outslip.')
      return
    }

    setBusy(true)
    try {
      const receiving = linkedReceiving
      const created = await createOutslip({
        customerId: createForm.customerId,
        receivingId: receiving?.dbId ?? createForm.receivingId,
      })
      showToast('success', `Outslip ${created?.id ?? ''} created.`)
      setCreateOpen(false)
      setCreateForm({ customerId: '', receivingId: '' })
      if (created?.id) setViewId(created.id)
    } catch (caught) {
      showToast('error', caught?.message ?? 'Could not create outslip.')
    } finally {
      setBusy(false)
    }
  }

  const handleApprove = async (id) => {
    setBusy(true)
    try {
      await approveOutslip(id)
      showToast('success', 'Outslip approved.')
    } catch (caught) {
      showToast('error', caught?.message ?? 'Could not approve outslip.')
    } finally {
      setBusy(false)
    }
  }

  const handleDispatch = async (id) => {
    setBusy(true)
    try {
      await forDispatchOutslip(id)
      showToast('success', 'Outslip marked for dispatch. Inventory has been updated.')
      setDispatchId(null)
    } catch (caught) {
      showToast('error', caught?.message ?? 'Could not mark for dispatch.')
    } finally {
      setBusy(false)
    }
  }

  const handleCreateDR = async (osId) => {
    setBusy(true)
    try {
      const drId = await createDeliveryFromOutslip(osId)
      showToast('success', 'Delivery Receipt created successfully.')
      if (drId) navigate('/delivery-receipt')
    } catch (caught) {
      showToast('error', caught?.message ?? 'Could not create delivery receipt.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Outslip"
        description="Outgoing stock to customers. Posts inventory OUT on dispatch."
        breadcrumbs={['Transaction', 'Outslip']}
        action={
          <Button
            onClick={() => {
              setCreateForm({
                customerId: '',
                receivingId: receivingFromUrl ?? '',
              })
              setCreateOpen(true)
            }}
          >
            New Outslip
          </Button>
        }
      />

      {loading ? (
        <p className="mb-4 text-sm text-text-secondary">Loading outslips…</p>
      ) : null}

      <StatusTabs
        active={statusTab}
        onChange={setStatusTab}
        tabs={[
          { key: 'all', label: 'All', count: counts.all },
          { key: 'pending', label: 'Pending', count: counts.pending },
          { key: 'approved', label: 'Approved', count: counts.approved },
          { key: 'for_dispatch', label: 'For Dispatch', count: counts.for_dispatch },
        ]}
      />

      <TableFilters
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search outslips..."
        showDateRange
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      <ResponsiveTable
        emptyMessage="No outslips found."
        mobileItems={filtered.map((o) => {
          const st = getStatusDisplay(o.status === 'released' ? 'for_dispatch' : o.status)
          const itemCount = (o.items ?? []).reduce((s, i) => s + i.quantity, 0)
          return {
            id: o.id,
            title: o.id,
            subtitle: o.customerName || o.customerId,
            badge: { label: st.label, variant: st.variant },
            fields: [
              { label: 'Date', value: o.displayDate || o.date },
              { label: 'Items', value: `${itemCount} units` },
            ],
            onClick: () => openDetail(o.id),
          }
        })}
        desktop={
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Outslip No.</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
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
                filtered.map((o) => {
                  const st = getStatusDisplay(o.status === 'released' ? 'for_dispatch' : o.status)
                  const itemCount = (o.items ?? []).reduce((s, i) => s + i.quantity, 0)
                  return (
                    <TableRow key={o.id}>
                      <TableCell>
                        <TableLink onClick={() => openDetail(o.id)}>{o.id}</TableLink>
                      </TableCell>
                      <TableCell>{o.receivingId ? `RCV #${o.receivingId}` : '—'}</TableCell>
                      <TableCell>{o.customerName || o.customerId}</TableCell>
                      <TableCell>{o.displayDate || o.date}</TableCell>
                      <TableCell>{itemCount} items</TableCell>
                      <TableCell>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </TableCell>
                      <TableCell className={TABLE_ACTIONS_CELL_CLASS}>
                        <TableActions onPrint={() => window.print()} />
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        }
      />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Outslip" size="md">
        <div className="space-y-4">
          <FormField label="Customer">
            <select
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
              value={createForm.customerId}
              onChange={(e) => setCreateForm({ ...createForm, customerId: e.target.value })}
            >
              <option value="">Select customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="From Receiving (completed)">
            <select
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
              value={
                linkedReceiving?.dbId ??
                linkedReceiving?.id ??
                createForm.receivingId
              }
              onChange={(e) => setCreateForm({ ...createForm, receivingId: e.target.value })}
            >
              <option value="">Select receiving…</option>
              {completedReceivings.map((r) => (
                <option key={r.id} value={r.dbId ?? r.id}>
                  {r.id} — {r.supplierName || 'Receiving'}
                </option>
              ))}
            </select>
          </FormField>
          {linkedReceiving ? (
            <p className="text-xs text-text-secondary">
              Items: {(linkedReceiving.items ?? []).map((i) => i.productName).join(', ') || '—'}
            </p>
          ) : null}
          <Button disabled={busy} onClick={handleCreate}>
            {busy ? 'Creating…' : 'Create Outslip'}
          </Button>
        </div>
      </Modal>

      <Modal open={!!viewOs} onClose={() => setViewId(null)} title="Outslip Details" size="md">
        {viewOs ? (
          <div className="space-y-3 text-sm">
            <p>
              <strong>{viewOs.id}</strong> — {viewOs.customerName || viewOs.customerId}
            </p>
            <p>Reference: {viewOs.receivingId ? `RCV #${viewOs.receivingId}` : '—'}</p>
            <ul className="list-disc pl-5">
              {(viewOs.items ?? []).map((i) => (
                <li key={i.productId}>
                  {i.productName} × {i.quantity}
                </li>
              ))}
            </ul>
            {viewOs.status === 'pending' ? (
              <Button disabled={busy} onClick={() => handleApprove(viewOs.id)}>
                Approve
              </Button>
            ) : null}
            {viewOs.status === 'approved' ? (
              <Button disabled={busy} onClick={() => setDispatchId(viewOs.id)}>
                For Dispatch
              </Button>
            ) : null}
            {(viewOs.status === 'for_dispatch' || viewOs.status === 'released') ? (
              <Button disabled={busy} onClick={() => handleCreateDR(viewOs.id)}>
                Create Delivery Receipt
              </Button>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={!!dispatchId}
        onClose={() => setDispatchId(null)}
        title="For Dispatch"
        message="Mark this outslip ready for dispatch? Inventory will be updated."
        confirmLabel="Confirm"
        onConfirm={() => {
          if (dispatchId) handleDispatch(dispatchId)
        }}
      />
    </div>
  )
}
