import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { DATA_DIR } from "./db";
import { naira, wat } from "./format";
const FONT = path.join(process.cwd(), "assets/fonts/DejaVuSans.ttf");
const BOLD = path.join(process.cwd(), "assets/fonts/DejaVuSans-Bold.ttf");
const LOGO = path.join(process.cwd(), "public/mark.png");
export const RECEIPT_DIR = path.join(DATA_DIR, "receipts");
export type ReceiptData = { ref: string; title: string; buyer: string; email: string; kind: string; method: string; amount: number; fee: number; status: string; paidAt: Date; providerRef?: string | null };
export async function renderReceipt(r: ReceiptData): Promise<string> {
  fs.mkdirSync(RECEIPT_DIR, { recursive: true });
  const file = path.join(RECEIPT_DIR, `${r.ref.replace(/[^A-Za-z0-9-]/g, "")}.pdf`);
  const doc = new PDFDocument({ size: "A4", margin: 50, info: { Title: `Kraud receipt ${r.ref}`, Author: "Kraud" } });
  doc.registerFont("r", FONT); doc.registerFont("b", BOLD);
  const out = fs.createWriteStream(file); doc.pipe(out);
  doc.rect(0, 0, doc.page.width, 110).fill("#002454");
  if (fs.existsSync(LOGO)) doc.image(LOGO, 50, 28, { width: 54 });
  doc.fill("#ffffff").font("b").fontSize(26).text("kraud", 116, 34).font("r").fontSize(10).fillColor("#cfd8e3").text("Official payment receipt", 116, 66);
  doc.font("b").fontSize(10).fillColor("#ffffff").text(r.status, 0, 46, { align: "right", width: doc.page.width - 50 });
  doc.moveDown(4).fillColor("#8A9199").font("r").fontSize(10).text("Total paid", 50, 140);
  doc.fillColor("#002454").font("b").fontSize(28).text(naira(r.amount + r.fee), 50, 156);
  const rows: [string, string][] = [["Reference", r.ref], ["Monnify reference", r.providerRef || "—"], ["Description", r.title], ["Type", r.kind], ["Customer", `${r.buyer} <${r.email}>`], ["Payment method", r.method], ["Date", wat(r.paidAt)], ["Amount", naira(r.amount)], ["Escrow / service fee", naira(r.fee)], ["Status", r.status]];
  let y = 210;
  for (const [k, v] of rows) { doc.moveTo(50, y - 6).lineTo(545, y - 6).strokeColor("#E4E7EB").stroke(); doc.font("r").fontSize(10).fillColor("#8A9199").text(k, 50, y, { width: 160 }); doc.font("b").fillColor("#0B1B33").text(v, 210, y, { width: 335, align: "right" }); y += 28; }
  doc.font("r").fontSize(9).fillColor("#8A9199").text("Processed via Monnify. Purchase funds are held by Kraud's escrow agent and released to the seller only after due diligence and handover. Keep this reference for disputes. Times are in West Africa Time (WAT).", 50, y + 20, { width: 495 });
  doc.fillColor("#1F7A72").text("kraud.ng · escrow-protected property across Nigeria", 50, 780, { width: 495, align: "center" });
  doc.end(); await new Promise<void>((res, rej) => { out.on("finish", () => res()); out.on("error", rej); });
  return file;
}
