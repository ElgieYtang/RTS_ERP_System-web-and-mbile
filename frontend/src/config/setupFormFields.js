export const SETUP_FORM_FIELDS = {
  users: [
    { key: 'name', label: 'Full Name', required: true },
    { key: 'username', label: 'Username', required: true },
    { key: 'type', label: 'Type', type: 'select', options: ['ADMIN', 'USER'], required: true },
    { key: 'position', label: 'Position' },
    { key: 'branch', label: 'Branch', required: true },
  ],
  companies: [
    { key: 'name', label: 'Company Name', required: true },
    { key: 'address', label: 'Address', required: true },
    { key: 'contactNo', label: 'Contact No.' },
    { key: 'tinNo', label: 'TIN' },
  ],
  branches: [
    { key: 'code', label: 'Branch Code', required: true },
    { key: 'name', label: 'Branch Name', required: true },
    { key: 'address', label: 'Address' },
    { key: 'contact', label: 'Contact' },
  ],
  projects: [
    { key: 'code', label: 'Project Code', required: true },
    { key: 'name', label: 'Project Name', required: true },
    { key: 'customer', label: 'Customer', required: true },
    { key: 'branch', label: 'Branch', required: true },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
  ],
  positions: [
    { key: 'name', label: 'Position', required: true },
    { key: 'description', label: 'Description' },
  ],
  categories: [
    { key: 'code', label: 'Category Code', required: true },
    { key: 'name', label: 'Category Name', required: true },
    { key: 'description', label: 'Description' },
  ],
  brands: [
    { key: 'code', label: 'Brand Code', required: true },
    { key: 'name', label: 'Brand Name', required: true },
  ],
  models: [
    { key: 'brand', label: 'Brand', required: true },
    { key: 'name', label: 'Model Name', required: true },
    { key: 'description', label: 'Description' },
  ],
  units: [
    { key: 'code', label: 'Code', required: true },
    { key: 'name', label: 'Unit Name', required: true },
    { key: 'description', label: 'Description' },
  ],
  items: [
    { key: 'code', label: 'Item Code', required: true },
    { key: 'brand', label: 'Brand', required: true },
    { key: 'model', label: 'Model', required: true },
    { key: 'name', label: 'Item Name', required: true },
    { key: 'unit', label: 'Unit', required: true },
  ],
  suppliers: [
    { key: 'code', label: 'Supplier Code', required: true },
    { key: 'name', label: 'Supplier Name', required: true },
    { key: 'contact', label: 'Contact Person' },
    { key: 'phone', label: 'Contact No.' },
    { key: 'email', label: 'Email', type: 'email' },
  ],
  customers: [
    { key: 'code', label: 'Customer Code', required: true },
    { key: 'name', label: 'Customer Name', required: true },
    { key: 'address', label: 'Address' },
    { key: 'tin', label: 'TIN' },
    { key: 'terms', label: 'Terms' },
  ],
}
