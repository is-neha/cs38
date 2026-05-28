const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['question', 'answer'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  oaqId: { type: mongoose.Schema.Types.ObjectId, ref: 'OAQ', required: true },
  reason: { type: String, required: true, maxlength: 500 },
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
