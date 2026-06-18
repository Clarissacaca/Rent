const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// GET semua notifikasi
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ created_at: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET jumlah notifikasi belum dibaca
router.get("/unread-count", async (req, res) => {
  try {
    const count = await Notification.countDocuments({ is_read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT tandai semua sudah dibaca
router.put("/read-all", async (req, res) => {
  try {
    await Notification.updateMany({}, { is_read: true });
    res.json({ message: "Semua notifikasi ditandai dibaca" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT tandai satu notifikasi dibaca
router.put("/:id/read", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { is_read: true });
    res.json({ message: "Notifikasi ditandai dibaca" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;