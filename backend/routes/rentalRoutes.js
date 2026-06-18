const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const Rental = require("../models/Rental");
const Product = require("../models/Product");
const Notification = require("../models/Notification");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "renttech/bukti-bayar",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});
const upload = multer({ storage });

// POST - Buat booking baru
router.post("/", async (req, res) => {
  try {
    const { user_id, product_id, nama_penyewa, no_telp, tanggal_mulai, tanggal_selesai, latitude, longitude, alamat_pickup } = req.body;
    const days = Math.ceil((new Date(tanggal_selesai) - new Date(tanggal_mulai)) / (1000 * 60 * 60 * 24));
    const payment_deadline = new Date(Date.now() + 10 * 60 * 1000);

    const product = await Product.findById(product_id);
    if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" });

    const total_harga = days * product.harga_sewa;
    const rental = new Rental({
      user_id, product_id, nama_penyewa, no_telp,
      tanggal_mulai, tanggal_selesai, total_harga,
      latitude, longitude, alamat_pickup,
      payment_status: "unpaid", payment_deadline
    });
    await rental.save();
    await Product.findByIdAndUpdate(product_id, { $inc: { stok: -1 } });
    res.json({ message: "Booking berhasil", id: rental._id, total_harga, payment_deadline });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - by user
router.get("/user/:user_id", async (req, res) => {
  try {
    const rentals = await Rental.find({ user_id: req.params.user_id })
      .populate({ path: "product_id", select: "nama_produk gambar kategori", populate: { path: "kategori", select: "nama_kategori" } })
      .sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT - Bayar
router.put("/:id/pay", async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: "Tidak ditemukan" });
    if (new Date() > new Date(rental.payment_deadline)) {
      await Rental.findByIdAndUpdate(req.params.id, { payment_status: "expired" });
      return res.status(400).json({ message: "Waktu pembayaran sudah habis, transaksi dibatalkan" });
    }
    await Rental.findByIdAndUpdate(req.params.id, { payment_status: "paid" });
    res.json({ message: "Pembayaran berhasil" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT - Return request
router.put("/:id/return-request", async (req, res) => {
  try {
    const rental = await Rental.findOneAndUpdate(
      { _id: req.params.id, status: "ongoing" },
      { status: "return_requested" },
      { new: true }
    );
    if (!rental) return res.status(400).json({ message: "Status tidak bisa diubah" });
    res.json({ message: "Pengajuan pengembalian berhasil" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT - Kembalikan
router.put("/:id/kembalikan", async (req, res) => {
  try {
    const { latitude_kembali, longitude_kembali, alamat_kembali, tanggal_kembali } = req.body;
    const rental = await Rental.findById(req.params.id).populate("product_id", "nama_produk");
    if (!rental) return res.status(404).json({ message: "Rental tidak ditemukan" });

    await Rental.findByIdAndUpdate(req.params.id, {
      latitude_kembali, longitude_kembali, alamat_kembali,
      tanggal_kembali: new Date(tanggal_kembali),
      status: "return_requested"
    });

    await Notification.create({
      judul: "Pengajuan Pengembalian Baru",
      pesan: `${rental.nama_penyewa || "Pengguna"} mengajukan pengembalian untuk produk "${rental.product_id?.nama_produk || "Produk Dihapus"}" di lokasi: ${alamat_kembali}`,
      tipe: "return",
      rental_id: rental._id
    });

    res.json({ message: "Pengembalian berhasil diajukan" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Upload bukti bayar
router.post("/:id/upload-bukti", upload.single("bukti"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File tidak ditemukan" });
    await Rental.findByIdAndUpdate(req.params.id, { bukti_bayar: req.file.path });
    res.json({ message: "Bukti berhasil diupload", bukti_bayar: req.file.path });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/// GET - by ID
router.get("/:id", async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate("product_id", "nama_produk harga_sewa kategori");

    if (!rental) {
      return res.status(404).json({
        message: "Rental tidak ditemukan",
      });
    }

    if (
      rental.payment_status === "unpaid" &&
      new Date() > new Date(rental.payment_deadline)
    ) {
      await Rental.findByIdAndUpdate(req.params.id, {
        payment_status: "expired",
      });

      rental.payment_status = "expired";
    }

    res.json(rental);
  } catch (err) {
    console.error("GET RENTAL ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;