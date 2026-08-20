import { QuotationPrint } from '@/components/documents/QuotationPrint'
import { PrintActions } from '@/components/documents/DocumentLayout'
import { useDemo } from '@/context/DemoContext'
import { useNavigate, useParams } from 'react-router-dom'

export function QuotationPreviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useDemo()
  const quotation = state.quotations.find((q) => q.id === id)

  if (!quotation) {
    return <p className="text-text-secondary">Quotation not found.</p>
  }

  const customer = state.customers.find((c) => c.id === quotation.customerId)
  const company = state.setupCompanies[0]

  return (
    <div className="quotation-print-page">
      <QuotationPrint
        quotation={quotation}
        customer={customer}
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
      <PrintActions onBack={() => navigate('/quotations')} />
    </div>
  )
}
