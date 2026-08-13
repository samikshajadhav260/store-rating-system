const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const ownerController = require("../controllers/ownerController");

router.get(
  "/dashboard",
  authenticateToken,
  requireRole("OWNER"),
  ownerController.getOwnerDashboard
);

module.exports = router;