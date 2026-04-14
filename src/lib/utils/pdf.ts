import type { ChecklistItemStatus } from "../database.types";
import autoTable from "jspdf-autotable";

interface PDFInspectionData {
  safety_score: number | null;
  started_at: string;
  notes: string | null;
  detailed_description?: string | null;
  project?: { name?: string; address?: string | null };
  template?: { name?: string };
  inspector?: { full_name?: string };
}

interface PDFItem {
  status: ChecklistItemStatus;
  is_critical: boolean;
  comment: string | null;
  template_item?: { text?: string; text_en?: string | null; section?: "questionnaire" | "components" };
}

const HEADER_BG: [number, number, number] = [30, 64, 175];

const STATUS_CFG: Record<string, { label: string; bg: [number, number, number]; text: [number, number, number] }> = {
  safe: { label: "VALID", bg: [220, 252, 231], text: [22, 163, 74] },
  violation: { label: "DAMAGED", bg: [254, 226, 226], text: [220, 38, 38] },
  not_applicable: { label: "N/A", bg: [241, 245, 249], text: [148, 163, 184] },
};

function getScoreColor(score: number): [number, number, number] {
  if (score >= 90) return [34, 197, 94];
  if (score >= 70) return [234, 179, 8];
  if (score >= 50) return [249, 115, 22];
  return [239, 68, 68];
}

export async function generatePDF(
  inspection: PDFInspectionData,
  items: PDFItem[]
): Promise<{ fontLoaded: boolean }> {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  // Load Georgian-compatible font
  let fontLoaded = false;
  try {
    const [res, resBold] = await Promise.all([
      fetch("/fonts/DejaVuSans.ttf"),
      fetch("/fonts/DejaVuSans-Bold.ttf"),
    ]);
    const [buf, bufBold] = await Promise.all([res.arrayBuffer(), resBold.arrayBuffer()]);
    doc.addFileToVFS("DejaVuSans.ttf", uint8ToBase64(new Uint8Array(buf)));
    doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
    doc.addFileToVFS("DejaVuSans-Bold.ttf", uint8ToBase64(new Uint8Array(bufBold)));
    doc.addFont("DejaVuSans-Bold.ttf", "DejaVu", "bold");
    doc.setFont("DejaVu", "normal");
    fontLoaded = true;
  } catch (e) {
    console.error("Font load error:", e);
  }

  const fontFamily = fontLoaded ? "DejaVu" : "helvetica";
  function setBold() { doc.setFont(fontFamily, "bold"); }
  function setNormal() { doc.setFont(fontFamily, "normal"); }

  const pw = doc.internal.pageSize.width;
  const ph = doc.internal.pageSize.height;
  const m = 14;
  let y = 0;

  // ========== HEADER ==========
  doc.setFillColor(...HEADER_BG);
  doc.rect(0, 0, pw, 28, "F");
  setBold();
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("Sarke", m, 12);
  setNormal();
  doc.setFontSize(9);
  doc.text("Inspection Report", m, 19);

  // Score badge — dynamically sized
  const score = inspection.safety_score ?? 0;
  const sc = getScoreColor(score);
  const scoreText = `${score}%`;
  setBold();
  doc.setFontSize(16);
  const scoreW = Math.max(doc.getTextWidth(scoreText) + 10, 28);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pw - m - scoreW, 5, scoreW, 18, 3, 3, "F");
  doc.setTextColor(...sc);
  doc.text(scoreText, pw - m - scoreW / 2, 17, { align: "center" });

  y = 38;

  // ========== INFO CARD ==========
  const templateName = inspection.template?.name || "Inspection";
  setBold();
  doc.setFontSize(11);
  const templateLines = doc.splitTextToSize(templateName, pw - m * 2 - 12);
  const extraLines = Math.max(0, templateLines.length - 1);
  const cardHeight = 35 + extraLines * 5;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(m, y, pw - m * 2, cardHeight, 3, 3, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(m, y, pw - m * 2, cardHeight, 3, 3, "S");

  y += 9;
  doc.setTextColor(15, 23, 42);
  doc.text(templateLines, m + 6, y);

  y += 7 + extraLines * 5;
  setNormal();
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${inspection.project?.name || "-"}  |  ${inspection.project?.address || ""}`, m + 6, y);
  y += 5;
  doc.text(`${inspection.inspector?.full_name || "-"}  |  ${new Date(inspection.started_at).toLocaleDateString("ka-GE")}`, m + 6, y);

  // Stats pills — dynamic widths
  y += 8;
  const counts = [
    { label: "Valid", count: items.filter((i) => i.status === "safe").length, bg: [220, 252, 231] as const, text: [22, 163, 74] as const },
    { label: "Damaged", count: items.filter((i) => i.status === "violation").length, bg: [254, 226, 226] as const, text: [220, 38, 38] as const },
    { label: "N/A", count: items.filter((i) => i.status === "not_applicable").length, bg: [241, 245, 249] as const, text: [148, 163, 184] as const },
  ];
  doc.setFontSize(8);
  let px = m + 6;
  for (const pill of counts) {
    const pillText = `${pill.label}: ${pill.count}`;
    setNormal();
    doc.setFontSize(8);
    const tw = doc.getTextWidth(pillText) + 6;
    doc.setFillColor(pill.bg[0], pill.bg[1], pill.bg[2]);
    doc.roundedRect(px, y - 3.5, tw, 6, 1, 1, "F");
    doc.setTextColor(pill.text[0], pill.text[1], pill.text[2]);
    doc.text(pillText, px + 3, y);
    px += tw + 4;
  }

  y += 12;

  // ========== TABLES PER SECTION (using jspdf-autotable) ==========
  const questionnaire = items.filter((i) => i.template_item?.section === "questionnaire");
  const components = items.filter((i) => (i.template_item?.section ?? "components") === "components");

  function renderSection(sectionItems: PDFItem[], heading: string | null) {
    if (sectionItems.length === 0) return;

    if (heading) {
      if (y + 12 > ph - 20) { doc.addPage(); y = 20; }
      setBold();
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(heading, m, y);
      y += 5;
    }

    const tableBody = sectionItems.map((item, idx) => {
      const critical = item.is_critical && item.status === "violation" ? " !" : "";
      const text = item.template_item?.text_en
        ? `${item.template_item.text}\n${item.template_item.text_en}`
        : item.template_item?.text || "-";
      return [
        `${idx + 1}${critical}`,
        text,
        (STATUS_CFG[item.status] || STATUS_CFG.not_applicable).label,
        item.comment || "",
      ];
    });

    autoTable(doc, {
      startY: y,
      margin: { left: m, right: m },
      head: [["#", "Item / Component", "Status", "Comment"]],
      body: tableBody,
      theme: "grid",
      headStyles: {
        fillColor: HEADER_BG,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7,
        font: fontFamily,
      },
      styles: {
        font: fontFamily,
        fontSize: 7,
        cellPadding: 2,
        lineColor: [241, 245, 249],
        lineWidth: 0.2,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 26, halign: "center" },
        3: { cellWidth: 38 },
      },
      didParseCell(data) {
        if (data.section !== "body") return;
        const rowIdx = data.row.index;
        const item = sectionItems[rowIdx];
        if (!item) return;

        if (data.column.index === 2) {
          const cfg = STATUS_CFG[item.status] || STATUS_CFG.not_applicable;
          data.cell.styles.textColor = cfg.text;
          data.cell.styles.fontStyle = "bold";
        }

        if (item.status === "violation") {
          data.cell.styles.fillColor = [254, 236, 236];
        }

        if (data.column.index === 0) {
          data.cell.styles.textColor = [148, 163, 184];
        }

        if (data.column.index === 3) {
          data.cell.styles.textColor = [100, 116, 139];
        }
      },
      didDrawCell(data) {
        if (data.section !== "body" || data.column.index !== 0) return;
        const item = sectionItems[data.row.index];
        if (!item || !item.is_critical || item.status !== "violation") return;
        const cx = data.cell.x + data.cell.width - 4;
        const cy = data.cell.y + data.cell.height / 2;
        doc.setFillColor(239, 68, 68);
        doc.circle(cx, cy, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(5);
        setBold();
        doc.text("!", cx - 0.7, cy + 1);
        setNormal();
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // Render both sections (or single if no questionnaire)
  if (questionnaire.length > 0) {
    renderSection(questionnaire, "Checklist / კითხვარი");
  }
  renderSection(
    components,
    questionnaire.length > 0 ? "Components / კომპონენტები" : null,
  );

  y += 4;

  // ========== DETAILED DESCRIPTION + CONCLUSION ==========
  function renderTextBlock(title: string, content: string) {
    setNormal();
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(content, pw - m * 2);
    const blockHeight = lines.length * 4 + 10;

    if (y + blockHeight > ph - 20) {
      doc.addPage();
      y = 20;
    }

    setBold();
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(title, m, y);
    y += 5;
    setNormal();
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(lines, m, y);
    y += lines.length * 4 + 4;
  }

  if (inspection.detailed_description) {
    renderTextBlock("Detailed description / დეტალური აღწერა:", inspection.detailed_description);
  }
  if (inspection.notes) {
    renderTextBlock("Conclusion / დასკვნითი ნაწილი:", inspection.notes);
  }

  // Inspector + date line
  if (y + 10 < ph - 20) {
    y += 4;
    setNormal();
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${inspection.inspector?.full_name || "-"}  —  ${new Date(inspection.started_at).toLocaleDateString("ka-GE")}`,
      m,
      y,
    );
  }

  // ========== FOOTER ==========
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(m, ph - 14, pw - m, ph - 14);
    setNormal();
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Generated by Sarke", m, ph - 9);
    doc.text(`Page ${i} / ${pages}`, pw / 2, ph - 9, { align: "center" });
    doc.text(new Date().toLocaleDateString("ka-GE"), pw - m, ph - 9, { align: "right" });
  }

  const pName = (inspection.project?.name || "report").replace(/[^\w]/g, "_");
  doc.save(`Sarke_${pName}_${new Date().toISOString().split("T")[0]}.pdf`);

  return { fontLoaded };
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
