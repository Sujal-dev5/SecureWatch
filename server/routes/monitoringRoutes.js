const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createMonitoringController,
  getMonitorings,
  getMonitoring,
  updateMonitoringController,
  toggleMonitoringController,
  deleteMonitoringController,
  getMonitoringEvents,
  markMonitoringEventRead,
} = require("../controllers/monitoringController");

const router = express.Router();

router.post("/", protect, createMonitoringController);

router.get("/", protect, getMonitorings);

router.get("/events", protect, getMonitoringEvents);

router.get("/:id", protect, getMonitoring);

router.patch(
  "/events/:id/read",
  protect,
  markMonitoringEventRead
);

router.put("/:id", protect, updateMonitoringController);

router.patch(
  "/:id/toggle",
  protect,
  toggleMonitoringController
);

router.delete("/:id", protect, deleteMonitoringController);

module.exports = router;