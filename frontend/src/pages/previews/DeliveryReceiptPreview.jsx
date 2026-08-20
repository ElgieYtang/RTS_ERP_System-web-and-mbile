import { DeliveryReceiptPrint } from '@/components/documents/DeliveryReceiptPrint'
import { PrintActions } from '@/components/documents/DocumentLayout'
import { useDemo } from '@/context/DemoContext'
import { useNavigate, useParams } from 'react-router-dom'

export function DeliveryReceiptPreviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useDemo()
  const deliveryReceipt = state.deliveryReceipts.find((dr) => dr.id === id)

  if (!deliveryReceipt) {
    return <p className="text-text-secondary">Delivery receipt not found.</p>
  }

  const customer = state.customers.find((c) => c.id === deliveryReceipt.customerId)
  const outslip = state.outslips.find((o) => o.id === deliveryReceipt.referenceOutslipId)
  const company = state.setupCompanies[0]

  return (
    <div className="quotation-print-page">
      <DeliveryReceiptPrint
        deliveryReceipt={deliveryReceipt}
        customer={customer}
        outslip={outslip}
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
      <PrintActions onBack={() => navigate('/delivery-receipt')} />
    </div>
  )
}
