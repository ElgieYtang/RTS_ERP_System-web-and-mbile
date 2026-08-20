import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { TABLE_ACTIONS_CELL_CLASS, TABLE_ACTIONS_HEAD_CLASS, TableActions } from '@/components/ui/action-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { FormField, Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { EmptyState, TableFilters } from '@/components/ui/table-filters'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDemo } from '@/context/DemoContext'
import { getStatusDisplay } from '@/lib/status'

function emptyForm(fields) {
  return Object.fromEntries(fields.map((field) => [field.key, '']))
}

export function SetupListPage({
  title,
  description,
  breadcrumbs,
  actionLabel = '+ Add',
  columns,
  rows,
  formFields = [],
  rowIdKey = 'id',
  statusKey = 'status',
  searchPlaceholder = 'Search...',
  onAdd,
  onEdit,
  onDelete,
}) {
  const { showToast } = useDemo()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(() => emptyForm(formFields))
  const [deleteId, setDeleteId] = useState(null)

  const statusOptions = useMemo(() => {
    const values = [...new Set(rows.map((row) => row[statusKey]).filter(Boolean))]
    return values.map((value) => ({ value, label: value }))
  }, [rows, statusKey])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (statusFilter !== 'all' && row[statusKey] !== statusFilter) return false
      if (!q) return true
      return columns.some((col) => String(row[col.key] ?? '').toLowerCase().includes(q))
    })
  }, [rows, search, statusFilter, columns, statusKey])

  const openAddModal = () => {
    setEditingId(null)
    setForm(emptyForm(formFields))
    setModalOpen(true)
  }

  const openEditModal = (row) => {
    setEditingId(row[rowIdKey])
    setForm(Object.fromEntries(formFields.map((field) => [field.key, row[field.key] ?? ''])))
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyForm(formFields))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    for (const field of formFields) {
      if (field.required && !String(form[field.key] ?? '').trim()) {
        showToast('error', `${field.label} is required.`)
        return
      }
    }

    const payload = Object.fromEntries(
      formFields.map((field) => [field.key, String(form[field.key] ?? '').trim()]),
    )

    if (editingId != null) {
      onEdit?.(editingId, payload)
      showToast('success', `${title.replace(' Setup', '')} updated successfully.`)
    } else {
      onAdd?.(payload)
      showToast('success', `${title.replace(' Setup', '')} added successfully.`)
    }

    closeModal()
  }

  const handleDelete = () => {
    if (deleteId == null) return
    onDelete?.(deleteId)
    showToast('success', 'Record deactivated successfully.')
    setDeleteId(null)
  }

  const modalTitle = editingId ? `Edit ${title.replace(' Setup', '')}` : actionLabel.replace(/^\+ /, '')

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        action={
          formFields.length > 0 ? (
            <Button onClick={openAddModal}>{actionLabel}</Button>
          ) : null
        }
      />

      <Card>
        <CardContent className="pt-4">
          <TableFilters
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={searchPlaceholder}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            statusOptions={statusOptions}
          />

          {filtered.length === 0 ? (
            <EmptyState message="No records found." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {columns.map((col) => (
                      <TableHead key={col.key}>{col.label}</TableHead>
                    ))}
                    <TableHead className={TABLE_ACTIONS_HEAD_CLASS}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => (
                    <TableRow key={row[rowIdKey]}>
                      {columns.map((col) => (
                        <TableCell key={col.key}>
                          {col.key === statusKey && row[col.key] ? (
                            <Badge variant={getStatusDisplay(row[col.key]).variant}>
                              {row[col.key]}
                            </Badge>
                          ) : (
                            row[col.key]
                          )}
                        </TableCell>
                      ))}
                      <TableCell className={TABLE_ACTIONS_CELL_CLASS}>
                        <TableActions
                          onEdit={formFields.length > 0 ? () => openEditModal(row) : undefined}
                          onDelete={
                            onDelete && row[statusKey] !== 'Inactive'
                              ? () => setDeleteId(row[rowIdKey])
                              : undefined
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={closeModal} title={modalTitle} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {formFields.map((field) => (
              <FormField
                key={field.key}
                label={field.label}
                className={field.type === 'textarea' ? 'sm:col-span-2' : undefined}
              >
                {field.type === 'select' ? (
                  <select
                    value={form[field.key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="flex h-9 w-full rounded-md border border-border-input bg-surface px-3 text-sm text-text-primary focus-visible:border-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-light"
                    required={field.required}
                  >
                    <option value="">Select...</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    type={field.type ?? 'text'}
                    value={form[field.key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    required={field.required}
                  />
                )}
              </FormField>
            ))}
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">{editingId ? 'Save Changes' : 'Add Record'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Deactivate record?"
        message="This record will be marked as inactive."
        confirmLabel="Deactivate"
      />
    </div>
  )
}
