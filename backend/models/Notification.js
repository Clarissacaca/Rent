const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  judul: { type: String, required: true },
  pesan: { type: String, required: true },
  tipe: { type: String, default: 'info' },
  is_read: { type: Boolean, default: false },
  rental_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental', default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Notification', NotificationSchema);