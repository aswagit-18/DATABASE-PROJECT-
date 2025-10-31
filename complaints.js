import express from "express";
import pool from "../db.js";
const router = express.Router();
router.post("/", async (req, res) => {
  try {
    const { reg_no, student_name, room_no, work_type, category, comments } = req.body;
    const result = await pool.query(
      `INSERT INTO complaints (reg_no, student_name, room_no, work_type, category, comments)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [reg_no, student_name, room_no, work_type, category, comments]
    );
    res.status(201).json({ message: "Complaint submitted!", complaint: result.rows[0] });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM complaints ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_to } = req.body;
    const result = await pool.query(
      `UPDATE complaints
       SET status = $1, assigned_to = $2
       WHERE id = $3
       RETURNING *`,
      [status, assigned_to, id]
    );
    res.json({ message: "Complaint updated!", complaint: result.rows[0] });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});
router.delete("/delete/all", async (req, res) => {
  try {
    await pool.query("DELETE FROM complaints");
    res.status(200).json({ message: "All complaints deleted successfully" });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Failed to delete complaints" });
  }
});
export default router;
