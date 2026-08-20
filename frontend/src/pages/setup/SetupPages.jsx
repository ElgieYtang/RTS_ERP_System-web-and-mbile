import { SETUP_FORM_FIELDS } from '@/config/setupFormFields'
import { useDemo } from '@/context/DemoContext'
import { SetupListPage } from '@/pages/setup/SetupListPage'

function formatCustomerTerms(customer) {
  if (!customer.terms) return '—'
  return customer.termsType ? `${customer.terms} ${customer.termsType}` : customer.terms
}

export function UserSetupPage() {
  const { state, addSetupUser, updateSetupUser, deactivateSetupUser } = useDemo()

  return (
    <SetupListPage
      title="User Setup"
      description="System users. Type is ADMIN or USER (setup_users.type)."
      breadcrumbs={['Setup', 'User']}
      actionLabel="+ Add User"
      searchPlaceholder="Search user..."
      rowIdKey="id"
      formFields={SETUP_FORM_FIELDS.users}
      onAdd={addSetupUser}
      onEdit={updateSetupUser}
      onDelete={deactivateSetupUser}
      columns={[
        { key: 'id', label: 'User ID' },
        { key: 'name', label: 'Name' },
        { key: 'username', label: 'Username' },
        { key: 'type', label: 'Type' },
        { key: 'position', label: 'Position' },
        { key: 'branch', label: 'Branch' },
        { key: 'status', label: 'Status' },
      ]}
      rows={state.setupUsers.map((user) => ({
        id: user.id,
        name: user.name,
        username: user.username,
        type: user.type,
        position: user.position,
        branch: user.branch,
        status: user.status,
      }))}
    />
  )
}

export function CompanySetupPage() {
  const { state, addSetupCompany, updateSetupCompany, deactivateSetupCompany } = useDemo()

  return (
    <SetupListPage
      title="Company Setup"
      description="Companies used on documents and branches."
      breadcrumbs={['Setup', 'Company']}
      actionLabel="+ Add Company"
      rowIdKey="id"
      formFields={SETUP_FORM_FIELDS.companies}
      onAdd={addSetupCompany}
      onEdit={updateSetupCompany}
      onDelete={deactivateSetupCompany}
      columns={[
        { key: 'name', label: 'Company Name' },
        { key: 'address', label: 'Address' },
        { key: 'contactNo', label: 'Contact No.' },
        { key: 'tinNo', label: 'TIN' },
        { key: 'status', label: 'Status' },
      ]}
      rows={state.setupCompanies.map((company) => ({
        id: company.id,
        name: company.name,
        address: company.address,
        contactNo: company.contactNo,
        tinNo: company.tinNo,
        status: company.status,
      }))}
    />
  )
}

export function BranchSetupPage() {
  const { state, addSetupBranch, updateSetupBranch, deactivateSetupBranch } = useDemo()

  return (
    <SetupListPage
      title="Branch Setup"
      description="Manage company branches."
      breadcrumbs={['Setup', 'Branch Setup']}
      actionLabel="+ Add Branch"
      rowIdKey="code"
      formFields={SETUP_FORM_FIELDS.branches}
      onAdd={addSetupBranch}
      onEdit={updateSetupBranch}
      onDelete={deactivateSetupBranch}
      columns={[
        { key: 'code', label: 'Branch Code' },
        { key: 'name', label: 'Branch Name' },
        { key: 'address', label: 'Address' },
        { key: 'contact', label: 'Contact' },
        { key: 'status', label: 'Status' },
      ]}
      rows={state.setupBranches.map((branch) => ({
        code: branch.code,
        name: branch.name,
        address: branch.address,
        contact: branch.contact,
        status: branch.status,
      }))}
    />
  )
}

export function ProjectSetupPage() {
  const { state, addSetupProject, updateSetupProject, deactivateSetupProject } = useDemo()

  return (
    <SetupListPage
      title="Project Setup"
      description="Manage customer projects."
      breadcrumbs={['Setup', 'Project Setup']}
      actionLabel="+ Add Project"
      rowIdKey="code"
      formFields={SETUP_FORM_FIELDS.projects}
      onAdd={addSetupProject}
      onEdit={updateSetupProject}
      onDelete={deactivateSetupProject}
      columns={[
        { key: 'code', label: 'Project Code' },
        { key: 'name', label: 'Project Name' },
        { key: 'customer', label: 'Customer' },
        { key: 'branch', label: 'Branch' },
        { key: 'startDate', label: 'Start Date' },
        { key: 'endDate', label: 'End Date' },
        { key: 'status', label: 'Status' },
      ]}
      rows={state.setupProjects.map((project) => ({
        code: project.code,
        name: project.name,
        customer: project.customer,
        branch: project.branch,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
      }))}
    />
  )
}

export function PositionSetupPage() {
  const { state, addSetupPosition, updateSetupPosition, deactivateSetupPosition } = useDemo()

  return (
    <SetupListPage
      title="Position Setup"
      description="Manage employee positions."
      breadcrumbs={['Setup', 'Position Setup']}
      actionLabel="+ Add Position"
      rowIdKey="name"
      formFields={SETUP_FORM_FIELDS.positions}
      onAdd={addSetupPosition}
      onEdit={updateSetupPosition}
      onDelete={deactivateSetupPosition}
      columns={[
        { key: 'name', label: 'Position' },
        { key: 'description', label: 'Description' },
        { key: 'status', label: 'Status' },
      ]}
      rows={state.setupPositions.map((position) => ({
        name: position.name,
        description: position.description,
        status: position.status,
      }))}
    />
  )
}

export function CategorySetupPage() {
  const { state, addSetupCategory, updateSetupCategory, deactivateSetupCategory } = useDemo()

  return (
    <SetupListPage
      title="Category Setup"
      description="Manage product categories."
      breadcrumbs={['Setup', 'Category']}
      actionLabel="+ Add Category"
      rowIdKey="code"
      formFields={SETUP_FORM_FIELDS.categories}
      onAdd={addSetupCategory}
      onEdit={updateSetupCategory}
      onDelete={deactivateSetupCategory}
      columns={[
        { key: 'code', label: 'Category Code' },
        { key: 'name', label: 'Category Name' },
        { key: 'description', label: 'Description' },
        { key: 'status', label: 'Status' },
      ]}
      rows={state.setupCategories.map((category) => ({
        code: category.code,
        name: category.name,
        description: category.description,
        status: category.status,
      }))}
    />
  )
}

export function BrandSetupPage() {
  const { state, addSetupBrand, updateSetupBrand, deactivateSetupBrand } = useDemo()

  return (
    <SetupListPage
      title="Brand Setup"
      description="Manage product brands."
      breadcrumbs={['Setup', 'Brand']}
      actionLabel="+ Add Brand"
      rowIdKey="code"
      formFields={SETUP_FORM_FIELDS.brands}
      onAdd={addSetupBrand}
      onEdit={updateSetupBrand}
      onDelete={deactivateSetupBrand}
      columns={[
        { key: 'code', label: 'Brand Code' },
        { key: 'name', label: 'Brand Name' },
        { key: 'status', label: 'Status' },
      ]}
      rows={state.setupBrands.map((brand) => ({
        code: brand.code,
        name: brand.name,
        status: brand.status,
      }))}
    />
  )
}

export function ModelSetupPage() {
  const { state, addSetupModel, updateSetupModel, deactivateSetupModel } = useDemo()

  return (
    <SetupListPage
      title="Model Setup"
      description="Manage product models linked to brands."
      breadcrumbs={['Setup', 'Model']}
      actionLabel="+ Add Model"
      rowIdKey="id"
      formFields={SETUP_FORM_FIELDS.models}
      onAdd={addSetupModel}
      onEdit={updateSetupModel}
      onDelete={deactivateSetupModel}
      columns={[
        { key: 'brand', label: 'Brand' },
        { key: 'name', label: 'Model Name' },
        { key: 'description', label: 'Description' },
        { key: 'status', label: 'Status' },
      ]}
      rows={state.setupModels.map((model) => ({
        id: `${model.brand}-${model.name}`,
        brand: model.brand,
        name: model.name,
        description: model.description,
        status: model.status,
      }))}
    />
  )
}

export function UnitMeasureSetupPage() {
  const { state, addSetupUnit, updateSetupUnit, deactivateSetupUnit } = useDemo()

  return (
    <SetupListPage
      title="Unit of Measure Setup"
      description="Manage units of measure."
      breadcrumbs={['Setup', 'Unit Measure']}
      actionLabel="+ Add Unit"
      rowIdKey="code"
      formFields={SETUP_FORM_FIELDS.units}
      onAdd={addSetupUnit}
      onEdit={updateSetupUnit}
      onDelete={deactivateSetupUnit}
      columns={[
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Unit Name' },
        { key: 'description', label: 'Description' },
        { key: 'status', label: 'Status' },
      ]}
      rows={state.setupUnits.map((unit) => ({
        code: unit.code,
        name: unit.name,
        description: unit.description,
        status: unit.status,
      }))}
    />
  )
}

export function ItemSetupPage() {
  const { state, addSetupItem, updateSetupItem, deactivateSetupItem } = useDemo()

  return (
    <SetupListPage
      title="Item Setup"
      description="Items are brand + model + name + unit (setup_items)."
      breadcrumbs={['Setup', 'Item']}
      actionLabel="+ Add Item"
      rowIdKey="code"
      formFields={SETUP_FORM_FIELDS.items}
      onAdd={addSetupItem}
      onEdit={updateSetupItem}
      onDelete={deactivateSetupItem}
      columns={[
        { key: 'code', label: 'Item Code' },
        { key: 'brand', label: 'Brand' },
        { key: 'model', label: 'Model' },
        { key: 'name', label: 'Item Name' },
        { key: 'unit', label: 'Unit' },
        { key: 'status', label: 'Status' },
      ]}
      rows={state.setupItems.map((item) => ({
        code: item.code,
        brand: item.brand,
        model: item.model,
        name: item.name,
        unit: item.unit,
        status: item.status,
      }))}
    />
  )
}

export function SupplierSetupPage() {
  const { state, addSupplier, updateSupplier, deactivateSupplier } = useDemo()

  return (
    <SetupListPage
      title="Supplier Setup"
      description="Manage supplier master records."
      breadcrumbs={['Setup', 'Supplier']}
      actionLabel="+ Add Supplier"
      rowIdKey="id"
      formFields={SETUP_FORM_FIELDS.suppliers}
      onAdd={addSupplier}
      onEdit={updateSupplier}
      onDelete={deactivateSupplier}
      columns={[
        { key: 'code', label: 'Supplier Code' },
        { key: 'name', label: 'Supplier Name' },
        { key: 'contact', label: 'Contact Person' },
        { key: 'phone', label: 'Contact No.' },
        { key: 'status', label: 'Status' },
      ]}
      rows={state.suppliers.map((supplier, index) => ({
        id: supplier.id,
        code: supplier.code ?? `SUP-${String(index + 1).padStart(3, '0')}`,
        name: supplier.name,
        contact: supplier.contactPerson,
        phone: supplier.phone,
        email: supplier.email,
        status: supplier.status ?? 'Active',
      }))}
    />
  )
}

export function CustomerSetupPage() {
  const { state, addCustomer, updateCustomer, deactivateCustomer } = useDemo()

  return (
    <SetupListPage
      title="Customer Setup"
      description="Manage customer master records."
      breadcrumbs={['Setup', 'Customer']}
      actionLabel="+ Add Customer"
      rowIdKey="id"
      formFields={SETUP_FORM_FIELDS.customers}
      onAdd={addCustomer}
      onEdit={updateCustomer}
      onDelete={deactivateCustomer}
      columns={[
        { key: 'code', label: 'Customer Code' },
        { key: 'name', label: 'Customer Name' },
        { key: 'address', label: 'Address' },
        { key: 'tin', label: 'TIN' },
        { key: 'terms', label: 'Terms' },
        { key: 'status', label: 'Status' },
      ]}
      rows={state.customers.map((customer, index) => ({
        id: customer.id,
        code: customer.code ?? `CUS-${String(index + 1).padStart(3, '0')}`,
        name: customer.name,
        address: customer.address,
        tin: customer.tinNo ?? '—',
        terms: formatCustomerTerms(customer),
        status: customer.status ?? 'Active',
      }))}
    />
  )
}
