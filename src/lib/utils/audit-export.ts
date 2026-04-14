import type { AppData } from "../store";
import type { Project } from "../database.types";
import { getDocumentStatus, computeRiskScore } from "./alerts";

/**
 * Generate a compliance audit package as a single PDF:
 * - Cover page (project + company + risk score)
 * - Documents list (with status)
 * - Inspections summary (score + violations per inspection)
 */
export async function generateAuditPackage(project: Project, data: AppData): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

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
  } catch {
    /* fall back to helvetica */
  }
  const ff = fontLoaded ? "DejaVu" : "helvetica";
  const bold = () => doc.setFont(ff, "bold");
  const normal = () => doc.setFont(ff, "normal");

  const pw = doc.internal.pageSize.width;
  const ph = doc.internal.pageSize.height;
  const m = 14;

  // ================= COVER =================
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pw, 60, "F");
  bold();
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text("Sarke", m, 22);
  doc.setFontSize(11);
  doc.text("Compliance Audit Package / აუდიტის პაკეტი", m, 32);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString("ka-GE"), m, 42);

  // Project info
  let y = 76;
  doc.setTextColor(15, 23, 42);
  bold();
  doc.setFontSize(16);
  const nameLines = doc.splitTextToSize(project.name, pw - m * 2);
  doc.text(nameLines, m, y);
  y += nameLines.length * 6 + 3;

  normal();
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  if (project.address) {
    doc.text(project.address, m, y);
    y += 6;
  }

  // Risk score box
  y += 6;
  const risk = computeRiskScore(project, data);
  const riskColor: [number, number, number] =
    risk.level === "high" ? [239, 68, 68] : risk.level === "medium" ? [245, 158, 11] : [34, 197, 94];
  doc.setFillColor(...riskColor);
  doc.roundedRect(m, y, 60, 22, 3, 3, "F");
  bold();
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("Risk Score", m + 4, y + 8);
  doc.setFontSize(18);
  doc.text(`${risk.score}`, m + 4, y + 18);
  doc.setFontSize(9);
  doc.text(risk.level.toUpperCase(), m + 28, y + 18);

  // Project summary stats
  const projectInspections = data.inspections.filter((i) => i.project_id === project.id && i.status === "completed");
  const projectDocs = (data.documents || []).filter((d) => d.project_id === project.id);
  const expiredDocs = projectDocs.filter((d) => getDocumentStatus(d) === "expired").length;
  const expiringDocs = projectDocs.filter((d) => getDocumentStatus(d) === "expiring_soon").length;

  doc.setTextColor(100, 116, 139);
  normal();
  doc.setFontSize(9);
  doc.text(`${projectInspections.length} completed inspections`, m + 68, y + 8);
  doc.text(`${projectDocs.length} documents (${expiredDocs} expired, ${expiringDocs} expiring)`, m + 68, y + 16);

  y += 32;

  // ================= DOCUMENTS TABLE =================
  bold();
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Documents / დოკუმენტები", m, y);
  y += 4;

  if (projectDocs.length === 0) {
    normal();
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("No documents", m, y + 6);
    y += 12;
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: m, right: m },
      head: [["Title", "Type", "Expiry", "Status"]],
      body: projectDocs.map((d) => {
        const status = getDocumentStatus(d);
        return [
          d.title,
          d.doc_type.replace(/_/g, " "),
          d.expiry_date ? new Date(d.expiry_date).toLocaleDateString("ka-GE") : "—",
          status === "expired" ? "EXPIRED" : status === "expiring_soon" ? "EXPIRING" : status === "valid" ? "VALID" : "—",
        ];
      }),
      headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: "bold", font: ff, fontSize: 8 },
      styles: { font: ff, fontSize: 8, cellPadding: 2 },
      didParseCell(d) {
        if (d.section !== "body") return;
        const row = projectDocs[d.row.index];
        if (!row) return;
        const status = getDocumentStatus(row);
        if (d.column.index === 3) {
          if (status === "expired") d.cell.styles.textColor = [220, 38, 38];
          else if (status === "expiring_soon") d.cell.styles.textColor = [161, 98, 7];
          else if (status === "valid") d.cell.styles.textColor = [22, 163, 74];
          d.cell.styles.fontStyle = "bold";
        }
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ================= INSPECTIONS TABLE =================
  if (y + 20 > ph - 20) {
    doc.addPage();
    y = 20;
  }
  bold();
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Inspections / ინსპექციები", m, y);
  y += 4;

  if (projectInspections.length === 0) {
    normal();
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("No completed inspections", m, y + 6);
    y += 12;
  } else {
    const rows = projectInspections
      .sort((a, b) => new Date(b.completed_at || b.started_at).getTime() - new Date(a.completed_at || a.started_at).getTime())
      .map((insp) => {
        const template = data.templates.find((t) => t.id === insp.template_id);
        const date = insp.completed_at || insp.started_at;
        const violations = insp.items.filter((i) => i.status === "violation").length;
        const inspector = data.users.find((u) => u.id === insp.inspector_id);
        return [
          new Date(date).toLocaleDateString("ka-GE"),
          template?.name || "—",
          inspector?.full_name || "—",
          `${insp.safety_score ?? 0}%`,
          String(violations),
        ];
      });
    autoTable(doc, {
      startY: y,
      margin: { left: m, right: m },
      head: [["Date", "Template", "Inspector", "Score", "Viol."]],
      body: rows,
      headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: "bold", font: ff, fontSize: 8 },
      styles: { font: ff, fontSize: 8, cellPadding: 2 },
      columnStyles: {
        3: { halign: "center", fontStyle: "bold" },
        4: { halign: "center" },
      },
      didParseCell(d) {
        if (d.section !== "body" || d.column.index !== 3) return;
        const insp = projectInspections[d.row.index];
        if (!insp) return;
        const score = insp.safety_score ?? 0;
        if (score >= 80) d.cell.styles.textColor = [22, 163, 74];
        else if (score >= 50) d.cell.styles.textColor = [161, 98, 7];
        else d.cell.styles.textColor = [220, 38, 38];
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ================= FOOTER =================
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(m, ph - 14, pw - m, ph - 14);
    normal();
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Sarke — sarke.ge", m, ph - 9);
    doc.text(`${i} / ${pages}`, pw / 2, ph - 9, { align: "center" });
    doc.text(new Date().toLocaleDateString("ka-GE"), pw - m, ph - 9, { align: "right" });
  }

  const fileName = `Sarke_Audit_${(project.name || "project").replace(/[^\w]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
