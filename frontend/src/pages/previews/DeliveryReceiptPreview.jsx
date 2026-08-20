import { jsx, jsxs } from "react/jsx-runtime";
import {
  DocumentLayout,
  DocumentRow,
  PrintActions
} from "@/components/documents/DocumentLayout";
import { useDemo } from "@/context/DemoContext";
import { getStatusDisplay } from "@/lib/status";
import { useNavigate, useParams } from "react-router-dom";
function DeliveryReceiptPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, getCustomerName } = useDemo();
  const dr = state.deliveryReceipts.find((d) => d.id === id);
  if (!dr) return /* @__PURE__ */ jsx("p", { className: "text-text-secondary", children: "Delivery receipt not found." });
  const outslip = state.outslips.find((o) => o.id === dr.referenceOutslipId);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs(DocumentLayout, { title: "DELIVERY RECEIPT", children: [
      /* @__PURE__ */ jsx(DocumentRow, { label: "DR No.", value: dr.id, highlight: true }),
      /* @__PURE__ */ jsx(DocumentRow, { label: "Date", value: dr.date }),
      /* @__PURE__ */ jsx(DocumentRow, { label: "Customer", value: getCustomerName(dr.customerId) }),
      /* @__PURE__ */ jsx(DocumentRow, { label: "Delivery Address", value: dr.deliveryAddress }),
      /* @__PURE__ */ jsx(DocumentRow, { label: "Driver", value: dr.driver }),
      /* @__PURE__ */ jsx(DocumentRow, { label: "Vehicle", value: dr.vehicle }),
      /* @__PURE__ */ jsx(DocumentRow, { label: "Reference Outslip", value: dr.referenceOutslipId }),
      /* @__PURE__ */ jsx(DocumentRow, { label: "Status", value: getStatusDisplay(dr.status).label }),
      outslip && /* @__PURE__ */ jsxs("div", { className: "mt-4 text-sm", children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium text-maroon", children: "Items Delivered" }),
        /* @__PURE__ */ jsx("ul", { className: "mt-2 list-disc pl-5", children: outslip.items.map((i) => /* @__PURE__ */ jsxs("li", { children: [
          i.productName,
          " \xD7 ",
          i.quantity
        ] }, i.productId)) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(PrintActions, { onBack: () => navigate("/delivery-receipt") })
  ] });
}
export {
  DeliveryReceiptPreviewPage
};
