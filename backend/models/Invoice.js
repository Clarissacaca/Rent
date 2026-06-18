const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  rental: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  total_bayar: { type: Number, required: true },
  status_bayar: { type: String, enum: ['belum bayar', 'lunas'], default: 'belum bayar' },
  tanggal_bayar: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);