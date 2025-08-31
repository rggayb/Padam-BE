// Import required modules
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./src/config/db");
const app = express();

// Import routes and other required files
const { getHomePage } = require("./src/utils/LandingPage.utils");
const nearestRoutes = require("./src/routes/Nearest.route");
const waterResourcesRoutes = require("./src/routes/WaterResources.route");

// Setup the server
dotenv.config();
db.connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Routes used in the application
app.get("/", getHomePage);
app.use("/nearest", nearestRoutes);
app.use("/water-resources", waterResourcesRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
