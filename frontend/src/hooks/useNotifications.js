import { useTransactions } from '@/context/TransactionContext'
import { useUserSettings } from '@/hooks/useUserSettings'
import { buildNotifications } from '@/lib/notifications'
import { useMemo } from 'react'

export function useNotifications() {
  const transactions = useTransactions()
  const { settings } = useUserSettings()

  const notifications = useMemo(
    () =>
      buildNotifications(
        {
          quotations: transactions.quotations,
          purchaseOrders: transactions.purchaseOrders,
          receivings: transactions.receivings,
          outslips: transactions.outslips,
          deliveryReceipts: transactions.deliveryReceipts,
          billingStatements: transactions.billingStatements,
        },
        settings,
      ),
    [
      transactions.quotations,
      transactions.purchaseOrders,
      transactions.receivings,
      transactions.outslips,
      transactions.deliveryReceipts,
      transactions.billingStatements,
      settings,
    ],
  )

  return {
    notifications,
    count: notifications.length,
    enabled: !!settings.notify_in_app,
    loading: transactions.loading,
  }
}
