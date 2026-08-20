import { PurchaseOrderPrint } from '@/components/documents/PurchaseOrderPrint'
import { PrintActions } from '@/components/documents/DocumentLayout'
import { useDemo } from '@/context/DemoContext'
import { useNavigate, useParams } from 'react-router-dom'

export function PurchaseOrderPreviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useDemo()
  const purchaseOrder = state.purchaseOrders.find((po) => po.id === id)

  if (!purchaseOrder) {
    return <p className="text-text-secondary">Purchase order not found.</p>
  }

  const supplier = state.suppliers.find((s) => s.id === purchaseOrder.supplierId)
  const company = state.setupCompanies[0]

  return (
    <div className="quotation-print-page">
      <PurchaseOrderPrint
        purchaseOrder={purchaseOrder}
        supplier={supplier}
        company={
          company
            ? {
                name: company.name,
                address: company.address,
                phone: `Tel no: ${company.contactNo}`,
                tin: `VAT REG. TIN.: ${company.tinNo}`,
                signatoryName: 'LARKE G. GELBOLINGO',
                signatoryTitle: 'CEO/PRESIDENT',
              }
            : undefined
        }
      />
      <PrintActions onBack={() => navigate('/purchase-order')} />
    </div>
  )
}
