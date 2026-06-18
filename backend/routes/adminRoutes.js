const express = require("express");
const router = express.Router();
const Rental = require("../models/Rental");
const Product = require("../models/Product");

router.get("/transactions", async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate({ path: "user_id", select: "nama email" })
      .populate({ path: "product_id", select: "nama_produk kategori", populate: { path: "kategori", select: "nama_kategori" } })
      .sort({ created_at: -1 });
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/transactions/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    await Rental.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: "Status diperbarui" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/transactions/:id/ambil", async (req, res) => {
  try {
    await Rental.findByIdAndUpdate(req.params.id, {
      tanggal_pengambilan: new Date(),
      status: "ongoing"
    });
    res.json({ message: "Status pengambilan diperbarui" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/transactions/:id/kembali", async (req, res) => {
  try {
    const { kondisi_kembali, catatan } = req.body;
    const rental = await Rental.findByIdAndUpdate(req.params.id, {
      tanggal_pengembalian_aktual: new Date(),
      kondisi_kembali,
      catatan,
      status: "completed"
    }, { new: true });

    if (!rental) return res.status(404).json({ message: "Tidak ditemukan" });
    await Product.findByIdAndUpdate(rental.product_id, { $inc: { stok: 1 } });
    res.json({ message: "Pengembalian dicatat, stok bertambah" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/transactions/:id/confirm-payment", async (req, res) => {
  try {
    await Rental.findByIdAndUpdate(req.params.id, { payment_status: "paid" });
    res.json({ message: "Pembayaran dikonfirmasi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/transactions/:id", async (req, res) => {
  try {
    const rental = await Rental.findByIdAndDelete(req.params.id);
    if (!rental) return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    res.json({ message: "Transaksi berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;