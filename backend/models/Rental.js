const mongoose = require('mongoose');

const RentalSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  nama_penyewa: { type: String },
  no_telp: { type: String },
  tanggal_mulai: { type: Date, required: true },
  tanggal_selesai: { type: Date, required: true },
  total_harga: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'ongoing', 'return_requested', 'completed', 'cancelled'], default: 'pending' },
  payment_status: { type: String, enum: ['unpaid', 'paid', 'expired'], default: 'unpaid' },
  payment_deadline: { type: Date },
  bukti_bayar: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  alamat_pickup: { type: String },
  latitude_kembali: { type: Number },
  longitude_kembali: { type: Number },
  alamat_kembali: { type: String },
  tanggal_kembali: { type: Date },
  tanggal_pengambilan: { type: Date },
  tanggal_pengembalian_aktual: { type: Date },
  kondisi_kembali: { type: String },
  catatan: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Rental', RentalSchema);