const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadDate: { type: Date, default: Date.now },
  size: { type: Number, required: true },
  type: { type: String, required: true }, // pdf, doc, etc
  tags: [{ type: String }],
  status: { type: String, enum: ['active', 'archived', 'deleted'], default: 'active' },
  sharedWith: [{ type: String }], // Array of user names or emails it's shared with for display
  views: { type: Number, default: 0 }
});

module.exports = mongoose.model('File', FileSchema);
