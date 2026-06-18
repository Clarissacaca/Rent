const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  nama_kategori: { type: String, required: true },
  deskripsi: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);