
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const { protect } = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Hospital Appointment Management API is running!",
  });
});

// Public route: admin login
app.use("/api/auth", require("./routes/authRoutes"));

// Protected routes: admin must be logged in
app.use("/api/patients", protect, require("./routes/patientRoutes"));
app.use("/api/doctors", protect, require("./routes/doctorRoutes"));
app.use(
  "/api/appointments",
  protect,
  require("./routes/appointmentRoutes")
);

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
