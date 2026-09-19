const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
app.use(express.json());

//Test route
app.get("/api/health", (req, res) => {
  res.json({
    message: "API is working",
  });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

// Authentication routes
app.use("/api/auth", authRoutes);

//Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
