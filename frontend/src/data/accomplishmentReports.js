const companyInfo = {
  name: "RESPONSIVCODE TECHNOLOGY SOLUTIONS",
  addressLines: [
    "Room 301E-3, Medalle Building, Fuente Osme\xF1a",
    "Cebu City 6000, Philippines"
  ],
  phone: "(032) 345-2283 / +63 917 573 4911",
  email: "lark.gel@gmail.com"
};
function sampleSitePhoto(index, caption) {
  const hues = [12, 28, 200, 150, 260, 35, 190, 8, 220];
  const hue = hues[(index - 1) % hues.length];
  const number = String(index).padStart(2, "0");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="hsl(${hue}, 32%, 78%)" />
          <stop offset="48%" stop-color="hsl(${hue}, 22%, 62%)" />
          <stop offset="100%" stop-color="hsl(${hue}, 18%, 36%)" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1200" fill="url(#sky)" />
      <rect x="120" y="820" width="1360" height="220" fill="rgba(0,0,0,0.28)" />
      <text x="800" y="910" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="42" fill="#ffffff">${caption}</text>
      <text x="800" y="970" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="26" fill="rgba(255,255,255,0.88)">Installation Photo ${number}</text>
    </svg>
  `.trim();
  return {
    id: `photo-${index}`,
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    alt: caption
  };
}
const accomplishmentReports = [
  {
    id: "AR-00001",
    projectName: "Provincial Capitol CCTV and Structured Cabling",
    location: "Provincial Capitol Compound, Tagbilaran City, Bohol",
    installationReportNo: "IR-2026-0142",
    date: "August 18, 2026",
    remarks: "Installation completed. All cameras tested and recording to NVR.",
    preparedBy: "Juan Dela Cruz",
    preparedByPosition: "Field Technician",
    confirmedByLabel: "Signature of Printed Name / Position",
    status: "approved",
    images: [
      sampleSitePhoto(1, "Building exterior \u2014 camera mount"),
      sampleSitePhoto(2, "Lobby \u2014 dome camera installed"),
      sampleSitePhoto(3, "Hallway \u2014 cabling pathway"),
      sampleSitePhoto(4, "IDF cabinet \u2014 patch panel"),
      sampleSitePhoto(5, "NVR rack \u2014 power and LAN"),
      sampleSitePhoto(6, "Stairwell \u2014 camera coverage")
    ]
  },
  {
    id: "AR-00002",
    projectName: "Office Access Control Upgrade",
    location: "Medalle Building, Fuente Osme\xF1a, Cebu City",
    installationReportNo: "IR-2026-0148",
    date: "August 19, 2026",
    remarks: "Door readers installed. Pending client training.",
    preparedBy: "Maria Santos",
    preparedByPosition: "Installation Lead",
    confirmedByLabel: "Signature of Printed Name / Position",
    status: "pending",
    images: [
      sampleSitePhoto(1, "Main door \u2014 reader installed"),
      sampleSitePhoto(2, "Server room \u2014 controller wiring"),
      sampleSitePhoto(3, "Reception \u2014 strike tested")
    ]
  },
  {
    id: "AR-00003",
    projectName: "Municipal Hall Network Backbone",
    location: "Municipal Hall, Tubigon, Bohol",
    installationReportNo: "IR-2026-0155",
    date: "August 18, 2026",
    remarks: "Fiber backbone and 8-camera CCTV coverage completed.",
    preparedBy: "Pedro Reyes",
    preparedByPosition: "Project Engineer",
    confirmedByLabel: "Signature of Printed Name / Position",
    status: "draft",
    images: [
      sampleSitePhoto(1, "Building exterior \u2014 camera mount"),
      sampleSitePhoto(2, "Lobby \u2014 dome camera installed"),
      sampleSitePhoto(3, "Hallway \u2014 cabling pathway"),
      sampleSitePhoto(4, "IDF cabinet \u2014 patch panel"),
      sampleSitePhoto(5, "NVR rack \u2014 power and LAN"),
      sampleSitePhoto(6, "Stairwell \u2014 camera coverage"),
      sampleSitePhoto(7, "Parking area \u2014 bullet camera"),
      sampleSitePhoto(8, "Control room \u2014 live view test"),
      sampleSitePhoto(9, "As-built labeling complete"),
      sampleSitePhoto(10, "Final client walkthrough")
    ]
  }
];
export {
  accomplishmentReports,
  companyInfo
};
