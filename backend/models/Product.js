const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  nama_produk: { type: String, required: true },
  deskripsi: { type: String },
  harga_sewa: { type: Number, required: true },
  stok: { type: Number, default: 0 },
  gambar: { type: String },
  kategori: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  status: { type: String, enum: ['tersedia', 'disewa', 'tidak tersedia'], default: 'tersedia' },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);