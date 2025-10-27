import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import complaintsRoutes from "./routes/complaints.js";
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/complaints", complaintsRoutes);
app.get("/", (req, res) => {
  res.send("Server is running!");
});
const PORT = 5050;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
