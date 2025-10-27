import express from "express";
import pool from "../db.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
const router = express.Router();
async function getFilteredComplaints({ from, to, type, reg_no }) {
  let query = "SELECT * FROM complaints WHERE 1=1";
  const params = [];
  if (from && to) {
    params.push(from, to);
    query += ` AND created_at BETWEEN $${params.length - 1} AND $${params.length}`;
  }
  if (type) {
    params.push(type);
    query += ` AND work_type = $${params.length}`;
  }
  if (reg_no) {
    params.push(reg_no);
    query += ` AND reg_no = $${params.length}`;
  }
  query += " ORDER BY created_at DESC";
  const result = await pool.query(query, params);
  return result.rows;
}
router.get("/pdf", async (req, res) => {
  try {
    const { from, to, type, reg_no } = req.query;
    const complaints = await getFilteredComplaints({ from, to, type, reg_no });
    const doc = new PDFDocument({ margin: 30, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=complaints_report.pdf");
    doc.fontSize(18).text("Student Hostel Complaint Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`);
    if (from && to) doc.text(`Date Range: ${from} → ${to}`);
    if (type) doc.text(`Work Type: ${type}`);
    if (reg_no) doc.text(`Student Reg No: ${reg_no}`);
    doc.moveDown();
    doc.font("Helvetica-Bold");
    doc.text("ID", 50);
    doc.text("Reg No", 100);
    doc.text("Type", 200);
    doc.text("Status", 300);
    doc.text("Created", 400);
    doc.moveDown(0.5);
    doc.font("Helvetica").moveDown();
    complaints.forEach((c) => {
      doc.text(c.id, 50);
      doc.text(c.reg_no, 100);
      doc.text(c.work_type, 200);
      doc.text(c.status, 300);
      doc.text(new Date(c.created_at).toLocaleDateString(), 400);
      doc.moveDown(0.5);
    });
    doc.end();
    doc.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});
router.get("/excel", async (req, res) => {
  try {
    const { from, to, type, reg_no } = req.query;
    const complaints = await getFilteredComplaints({ from, to, type, reg_no });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Complaints Report");
    sheet.columns = [
      { header: "ID", key: "id", width: 6 },
      { header: "Reg No", key: "reg_no", width: 15 },
      { header: "Name", key: "student_name", width: 25 },
      { header: "Room", key: "room_no", width: 15 },
      { header: "Work Type", key: "work_type", width: 15 },
      { header: "Category", key: "category", width: 15 },
      { header: "Status", key: "status", width: 12 },
      { header: "Assigned To", key: "assigned_to", width: 20 },
      { header: "Created At", key: "created_at", width: 20 }
    ];
    complaints.forEach((c) => sheet.addRow(c));
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=complaints_report.xlsx"
    );
    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate Excel" });
  }
});
export default router;
