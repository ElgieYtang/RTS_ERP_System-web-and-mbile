import { jsx, jsxs } from "react/jsx-runtime";
import { AccomplishmentReport } from "@/components/documents/AccomplishmentReport";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableLink,
  TableRow
} from "@/components/ui/table";
import {
  accomplishmentReports
} from "@/data/accomplishmentReports";
import { optimizeImageFile } from "@/lib/optimizeImage";
import { IMAGES_PER_PAGE, pageCountForImages } from "@/lib/reportPages";
import { Printer, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useErp } from "@/data/erpStore";
const statusLabel = {
  approved: "Approved",
  pending: "Pending",
  draft: "Draft"
};
function AccomplishmentReportsPage() {
  const [params] = useSearchParams();
  const { deliveryReceipts } = useErp();
  const linkedReceipt = deliveryReceipts.find((row) => row.id === params.get("dr"));
  const [selectedId, setSelectedId] = useState(accomplishmentReports[0].id);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const selectedReport = accomplishmentReports.find((report) => report.id === selectedId);
  const previewReport = useMemo(() => {
    if (!selectedReport) return void 0;
    return {
      ...selectedReport,
      projectName: linkedReceipt?.project ?? selectedReport.projectName,
      location: linkedReceipt?.destination ?? selectedReport.location,
      remarks: linkedReceipt ? `From ${linkedReceipt.id} / ${linkedReceipt.outslipId} / ${linkedReceipt.poId}. Customer: ${linkedReceipt.customer}.` : selectedReport.remarks,
      images: [...selectedReport.images, ...uploadedImages]
    };
  }, [selectedReport, uploadedImages, linkedReceipt]);
  const imageCount = previewReport?.images.length ?? 0;
  const pageCount = pageCountForImages(imageCount);
  function revokeUploaded(images) {
    images.forEach((image) => {
      if (image.src.startsWith("blob:")) {
        URL.revokeObjectURL(image.src);
      }
    });
  }
  function handleSelectReport(id) {
    setUploadedImages((current) => {
      revokeUploaded(current);
      return [];
    });
    setUploadError(null);
    setSelectedId(id);
  }
  async function handleUpload(event) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    setIsOptimizing(true);
    setUploadError(null);
    try {
      const optimizedImages = [];
      try {
        for (const [index, file] of files.entries()) {
          const optimizedBlob = await optimizeImageFile(file);
          optimizedImages.push({
            id: `upload-${Date.now()}-${index}`,
            src: URL.createObjectURL(optimizedBlob),
            alt: file.name.replace(/\.[^.]+$/, "")
          });
        }
        setUploadedImages((current) => [...current, ...optimizedImages]);
      } catch {
        revokeUploaded(optimizedImages);
        throw new Error("optimize-failed");
      }
    } catch {
      setUploadError(
        "One or more pictures could not be optimized. Please try a JPG or PNG photo."
      );
    } finally {
      setIsOptimizing(false);
    }
  }
  function handlePrint() {
    window.print();
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "no-print", children: [
      /* @__PURE__ */ jsx(
        PageHeader,
        {
          title: "Accomplishment Reports",
          description: "Photos are resized before use, then placed in a 2\xD72 grid (maximum 4 per page).",
          action: /* @__PURE__ */ jsxs(Button, { onClick: handlePrint, children: [
            /* @__PURE__ */ jsx(Printer, { className: "h-4 w-4" }),
            "Print / Save PDF"
          ] })
        }
      ),
      /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-transparent", children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Report No." }),
          /* @__PURE__ */ jsx(TableHead, { children: "Project Name" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Date" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Pictures" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Status" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: accomplishmentReports.map((report) => {
          const isSelected = report.id === selectedId;
          const count = report.id === selectedId ? imageCount : report.images.length;
          return /* @__PURE__ */ jsxs(
            TableRow,
            {
              className: isSelected ? "bg-maroon-light hover:bg-maroon-light" : void 0,
              children: [
                /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(TableLink, { onClick: () => handleSelectReport(report.id), children: report.id }) }),
                /* @__PURE__ */ jsx(TableCell, { children: report.projectName }),
                /* @__PURE__ */ jsx(TableCell, { children: report.date }),
                /* @__PURE__ */ jsx(TableCell, { children: count }),
                /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: report.status, children: statusLabel[report.status] }) })
              ]
            },
            report.id
          );
        }) })
      ] }),
      previewReport && /* @__PURE__ */ jsxs("div", { className: "mb-4 mt-6 flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-text-secondary", children: [
          "Previewing ",
          previewReport.id,
          ": ",
          imageCount,
          " picture",
          imageCount === 1 ? "" : "s",
          " across ",
          pageCount,
          " page",
          pageCount === 1 ? "" : "s",
          " (maximum ",
          IMAGES_PER_PAGE,
          " pictures per page).",
          isOptimizing ? " Optimizing selected photos\u2026" : ""
        ] }),
        /* @__PURE__ */ jsxs(
          "label",
          {
            className: `inline-flex cursor-pointer items-center gap-2 rounded-md border border-maroon bg-surface px-4 py-2 text-sm font-medium text-maroon hover:bg-maroon-light ${isOptimizing ? "pointer-events-none opacity-60" : ""}`,
            children: [
              /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
              isOptimizing ? "Optimizing\u2026" : "Upload pictures",
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "file",
                  accept: "image/*",
                  multiple: true,
                  className: "sr-only",
                  disabled: isOptimizing,
                  onChange: handleUpload
                }
              )
            ]
          }
        )
      ] }),
      uploadError && /* @__PURE__ */ jsx("p", { className: "mb-4 text-sm text-error-text", children: uploadError })
    ] }),
    previewReport && /* @__PURE__ */ jsx("div", { className: "report-preview-frame", children: /* @__PURE__ */ jsx(AccomplishmentReport, { report: previewReport }) })
  ] });
}
export {
  AccomplishmentReportsPage
};
