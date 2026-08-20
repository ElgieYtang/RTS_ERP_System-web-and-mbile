import { jsx, jsxs } from "react/jsx-runtime";
import logo from "@/assets/logo.png";
import {
  companyInfo
} from "@/data/accomplishmentReports";
import { groupImagesIntoPages } from "@/lib/reportPages";
function AccomplishmentReport({
  report,
  company = companyInfo
}) {
  const pages = groupImagesIntoPages(report.images);
  const totalPages = pages.length;
  return /* @__PURE__ */ jsx("div", { className: "report-document", children: pages.map((pageImages, pageIndex) => {
    const pageNumber = pageIndex + 1;
    const isFirstPage = pageIndex === 0;
    const isLastPage = pageNumber === totalPages;
    return /* @__PURE__ */ jsxs(
      "section",
      {
        className: "report-page",
        "aria-label": `Accomplishment Report page ${pageNumber} of ${totalPages}`,
        children: [
          isFirstPage ? /* @__PURE__ */ jsx(
            ReportLetterhead,
            {
              company,
              pageNumber,
              totalPages
            }
          ) : /* @__PURE__ */ jsxs("div", { className: "report-continued", children: [
            /* @__PURE__ */ jsx("h1", { className: "report-title", children: "ACCOMPLISHMENT REPORT" }),
            /* @__PURE__ */ jsxs("div", { className: "report-page-label", children: [
              "Page ",
              pageNumber,
              " of ",
              totalPages
            ] })
          ] }),
          isFirstPage ? /* @__PURE__ */ jsx(ReportInfoTable, { report }) : null,
          /* @__PURE__ */ jsx(PicturesSection, { images: pageImages, attached: isFirstPage }),
          isLastPage ? /* @__PURE__ */ jsx(SignatureSection, { report }) : null
        ]
      },
      `${report.id}-page-${pageNumber}`
    );
  }) });
}
function ReportLetterhead({
  company,
  pageNumber,
  totalPages
}) {
  return /* @__PURE__ */ jsxs("header", { className: "report-letterhead", children: [
    /* @__PURE__ */ jsxs("div", { className: "report-letterhead-row", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: logo,
          alt: `${company.name} logo`,
          className: "report-logo",
          width: 72,
          height: 72
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "report-company", children: [
        /* @__PURE__ */ jsx("div", { className: "report-company-name", children: company.name }),
        company.addressLines.map((line) => /* @__PURE__ */ jsx("div", { className: "report-company-meta", children: line }, line)),
        /* @__PURE__ */ jsxs("div", { className: "report-company-meta", children: [
          "Tel: ",
          company.phone
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "report-company-meta", children: [
          "Email: ",
          company.email
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("h1", { className: "report-title", children: "ACCOMPLISHMENT REPORT" }),
    /* @__PURE__ */ jsxs("div", { className: "report-page-label", children: [
      "Page ",
      pageNumber,
      " of ",
      totalPages
    ] })
  ] });
}
function ReportInfoTable({ report }) {
  return /* @__PURE__ */ jsx("table", { className: "report-info-table", children: /* @__PURE__ */ jsxs("tbody", { children: [
    /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("th", { children: "Project Name" }),
      /* @__PURE__ */ jsx("td", { children: report.projectName }),
      /* @__PURE__ */ jsx("th", { children: "Date" }),
      /* @__PURE__ */ jsx("td", { children: report.date })
    ] }),
    /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("th", { children: "Location" }),
      /* @__PURE__ */ jsx("td", { children: report.location }),
      /* @__PURE__ */ jsx("th", { children: "Remarks" }),
      /* @__PURE__ */ jsx("td", { rowSpan: 2, children: report.remarks })
    ] }),
    /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("th", { children: "Installation Report No." }),
      /* @__PURE__ */ jsx("td", { children: report.installationReportNo })
    ] })
  ] }) });
}
function PicturesSection({
  images,
  attached
}) {
  const rowCount = images.length > 2 ? 2 : 1;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: attached ? "report-pictures" : "report-pictures report-pictures-standalone",
      children: [
        /* @__PURE__ */ jsx("div", { className: "report-pictures-label", children: "Pictures" }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "report-image-grid image-grid",
            style: { gridTemplateRows: `repeat(${rowCount}, 1fr)` },
            children: images.map((image, index) => /* @__PURE__ */ jsx(
              "div",
              {
                className: "report-image-cell image-cell",
                children: /* @__PURE__ */ jsx("img", { src: image.src, alt: image.alt, draggable: false })
              },
              image.id ?? `image-${index}`
            ))
          }
        )
      ]
    }
  );
}
function SignatureSection({ report }) {
  return /* @__PURE__ */ jsxs("div", { className: "report-signatures", children: [
    /* @__PURE__ */ jsxs("div", { className: "report-signature-col", children: [
      /* @__PURE__ */ jsx("div", { className: "report-signature-heading", children: "Prepared By:" }),
      /* @__PURE__ */ jsx("div", { className: "report-signature-line" }),
      /* @__PURE__ */ jsx("div", { className: "report-signature-name", children: report.preparedBy }),
      /* @__PURE__ */ jsx("div", { className: "report-signature-role", children: "Name of Personnel" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "report-signature-col", children: [
      /* @__PURE__ */ jsx("div", { className: "report-signature-heading", children: "Confirmed By:" }),
      /* @__PURE__ */ jsx("div", { className: "report-signature-line" }),
      /* @__PURE__ */ jsx("div", { className: "report-signature-name", children: "Signature of Printed" }),
      /* @__PURE__ */ jsx("div", { className: "report-signature-role", children: "Name / Position" })
    ] })
  ] });
}
export {
  AccomplishmentReport
};
