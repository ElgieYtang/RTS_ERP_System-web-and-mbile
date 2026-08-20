import { jsx } from "react/jsx-runtime";
import { SetupListPage } from "@/pages/setup/SetupListPage";
import { useDemo } from "@/context/DemoContext";
function UserSetupPage() {
  const { state } = useDemo();
  return /* @__PURE__ */ jsx(
    SetupListPage,
    {
      title: "User Setup",
      description: "System users. Type is ADMIN or USER (setup_users.type).",
      breadcrumbs: ["Setup", "User"],
      actionLabel: "+ Add User",
      searchPlaceholder: "Search user...",
      columns: [
        { key: "id", label: "User ID" },
        { key: "name", label: "Name" },
        { key: "username", label: "Username" },
        { key: "type", label: "Type" },
        { key: "position", label: "Position" },
        { key: "branch", label: "Branch" },
        { key: "status", label: "Status" }
      ],
      rows: state.setupUsers.map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        type: u.type,
        position: u.position,
        branch: u.branch,
        status: u.status
      }))
    }
  );
}
function CompanySetupPage() {
  const { state } = useDemo();
  return /* @__PURE__ */ jsx(
    SetupListPage,
    {
      title: "Company Setup",
      description: "Companies used on documents and branches.",
      breadcrumbs: ["Setup", "Company"],
      actionLabel: "+ Add Company",
      columns: [
        { key: "name", label: "Company Name" },
        { key: "address", label: "Address" },
        { key: "contactNo", label: "Contact No." },
        { key: "tinNo", label: "TIN" },
        { key: "status", label: "Status" }
      ],
      rows: state.setupCompanies.map((c) => ({
        name: c.name,
        address: c.address,
        contactNo: c.contactNo,
        tinNo: c.tinNo,
        status: c.status
      }))
    }
  );
}
function BranchSetupPage() {
  const { state } = useDemo();
  return /* @__PURE__ */ jsx(
    SetupListPage,
    {
      title: "Branch Setup",
      description: "Manage company branches.",
      breadcrumbs: ["Setup", "Branch Setup"],
      actionLabel: "+ Add Branch",
      columns: [
        { key: "code", label: "Branch Code" },
        { key: "name", label: "Branch Name" },
        { key: "address", label: "Address" },
        { key: "contact", label: "Contact" },
        { key: "status", label: "Status" }
      ],
      rows: state.setupBranches.map((b) => ({
        code: b.code,
        name: b.name,
        address: b.address,
        contact: b.contact,
        status: b.status
      }))
    }
  );
}
function ProjectSetupPage() {
  const { state } = useDemo();
  return /* @__PURE__ */ jsx(
    SetupListPage,
    {
      title: "Project Setup",
      description: "Manage customer projects.",
      breadcrumbs: ["Setup", "Project Setup"],
      actionLabel: "+ Add Project",
      columns: [
        { key: "code", label: "Project Code" },
        { key: "name", label: "Project Name" },
        { key: "customer", label: "Customer" },
        { key: "branch", label: "Branch" },
        { key: "startDate", label: "Start Date" },
        { key: "endDate", label: "End Date" },
        { key: "status", label: "Status" }
      ],
      rows: state.setupProjects.map((p) => ({
        code: p.code,
        name: p.name,
        customer: p.customer,
        branch: p.branch,
        startDate: p.startDate,
        endDate: p.endDate,
        status: p.status
      }))
    }
  );
}
function PositionSetupPage() {
  const { state } = useDemo();
  return /* @__PURE__ */ jsx(
    SetupListPage,
    {
      title: "Position Setup",
      description: "Manage employee positions.",
      breadcrumbs: ["Setup", "Position Setup"],
      columns: [
        { key: "name", label: "Position" },
        { key: "description", label: "Description" },
        { key: "status", label: "Status" }
      ],
      rows: state.setupPositions.map((p) => ({
        name: p.name,
        description: p.description,
        status: p.status
      }))
    }
  );
}
function CategorySetupPage() {
  const { state } = useDemo();
  return /* @__PURE__ */ jsx(
    SetupListPage,
    {
      title: "Category Setup",
      description: "Manage product categories.",
      breadcrumbs: ["Setup", "Category"],
      columns: [
        { key: "code", label: "Category Code" },
        { key: "name", label: "Category Name" },
        { key: "description", label: "Description" },
        { key: "status", label: "Status" }
      ],
      rows: state.setupCategories.map((c) => ({
        code: c.code,
        name: c.name,
        description: c.description,
        status: c.status
      }))
    }
  );
}
function BrandSetupPage() {
  const { state } = useDemo();
  return /* @__PURE__ */ jsx(
    SetupListPage,
    {
      title: "Brand Setup",
      description: "Manage product brands.",
      breadcrumbs: ["Setup", "Brand"],
      columns: [
        { key: "code", label: "Brand Code" },
        { key: "name", label: "Brand Name" },
        { key: "status", label: "Status" }
      ],
      rows: state.setupBrands.map((b) => ({
        code: b.code,
        name: b.name,
        status: b.status
      }))
    }
  );
}
function ModelSetupPage() {
  const { state } = useDemo();
  return /* @__PURE__ */ jsx(
    SetupListPage,
    {
      title: "Model Setup",
      description: "Manage product models linked to brands.",
      breadcrumbs: ["Setup", "Model"],
      columns: [
        { key: "brand", label: "Brand" },
        { key: "name", label: "Model Name" },
        { key: "description", label: "Description" },
        { key: "status", label: "Status" }
      ],
      rows: state.setupModels.map((m) => ({
        brand: m.brand,
        name: m.name,
        description: m.description,
        status: m.status
      }))
    }
  );
}
function UnitMeasureSetupPage() {
  const { state } = useDemo();
  return /* @__PURE__ */ jsx(
    SetupListPage,
    {
      title: "Unit of Measure Setup",
      description: "Manage units of measure.",
      breadcrumbs: ["Setup", "Unit Measure"],
      columns: [
        { key: "code", label: "Code" },
        { key: "name", label: "Unit Name" },
        { key: "description", label: "Description" },
        { key: "status", label: "Status" }
      ],
      rows: state.setupUnits.map((u) => ({
        code: u.code,
        name: u.name,
        description: u.description,
        status: u.status
      }))
    }
  );
}
function ItemSetupPage() {
  const { state } = useDemo();
  return /* @__PURE__ */ jsx(
    SetupListPage,
    {
      title: "Item Setup",
      description: "Items are brand + model + name + unit (setup_items).",
      breadcrumbs: ["Setup", "Item"],
      actionLabel: "+ Add Item",
      columns: [
        { key: "code", label: "Item Code" },
        { key: "brand", label: "Brand" },
        { key: "model", label: "Model" },
        { key: "name", label: "Item Name" },
        { key: "unit", label: "Unit" },
        { key: "status", label: "Status" }
      ],
      rows: state.setupItems.map((i) => ({
        code: i.code,
        brand: i.brand,
        model: i.model,
        name: i.name,
        unit: i.unit,
        status: i.status
      }))
    }
  );
}
function SupplierSetupPage() {
  const { state } = useDemo();
  const codes = ["SUP-001", "SUP-002", "SUP-003"];
  return /* @__PURE__ */ jsx(
    SetupListPage,
    {
      title: "Supplier Setup",
      description: "Manage supplier master records.",
      breadcrumbs: ["Setup", "Supplier"],
      actionLabel: "+ Add Supplier",
      columns: [
        { key: "code", label: "Supplier Code" },
        { key: "name", label: "Supplier Name" },
        { key: "contact", label: "Contact Person" },
        { key: "phone", label: "Contact No." },
        { key: "status", label: "Status" }
      ],
      rows: state.suppliers.map((s, i) => ({
        code: codes[i] ?? `SUP-${i + 1}`,
        name: s.name,
        contact: s.contactPerson,
        phone: s.phone,
        email: s.email,
        status: "Active"
      }))
    }
  );
}
function CustomerSetupPage() {
  const { state } = useDemo();
  const codes = ["CUS-001", "CUS-002", "CUS-003", "CUS-004"];
  return /* @__PURE__ */ jsx(
    SetupListPage,
    {
      title: "Customer Setup",
      description: "Manage customer master records.",
      breadcrumbs: ["Setup", "Customer"],
      actionLabel: "+ Add Customer",
      columns: [
        { key: "code", label: "Customer Code" },
        { key: "name", label: "Customer Name" },
        { key: "address", label: "Address" },
        { key: "tin", label: "TIN" },
        { key: "terms", label: "Terms" },
        { key: "status", label: "Status" }
      ],
      rows: state.customers.map((c, i) => ({
        code: codes[i] ?? `CUS-${i + 1}`,
        name: c.name,
        address: c.address,
        tin: c.tinNo ?? "\u2014",
        terms: c.terms ? `${c.terms} ${c.termsType ?? "IN DAYS"}` : "\u2014",
        status: "Active"
      }))
    }
  );
}
export {
  BranchSetupPage,
  BrandSetupPage,
  CategorySetupPage,
  CompanySetupPage,
  CustomerSetupPage,
  ItemSetupPage,
  ModelSetupPage,
  PositionSetupPage,
  ProjectSetupPage,
  SupplierSetupPage,
  UnitMeasureSetupPage,
  UserSetupPage
};
