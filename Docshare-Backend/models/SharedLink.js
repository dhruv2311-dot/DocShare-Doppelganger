const mongoose = require('mongoose');

const SharedLinkSchema = new mongoose.Schema({
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
    fileName: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    permission: { type: String, enum: ['view', 'download', 'comment'], default: 'view' },
    expiresAt: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'expired', 'revoked'], default: 'active' },
    views: { type: Number, default: 0 },
    password: { type: String } // Optional protected password
});

module.exports = mongoose.model('SharedLink', SharedLinkSchema);
