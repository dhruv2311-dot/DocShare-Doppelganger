const File = require('../models/File');
const User = require('../models/User');
const { logAction } = require('../utils/auditLogger');
const cloudinary = require('../config/cloudinary');

const formatFileResponse = (file) => ({
  id: file._id,
  name: file.fileName,
  size: file.size,
  type: file.type,
  uploadedBy: file.owner.name || 'Unknown User', // Assuming populated owner
  uploadedById: file.owner._id,
  uploadedAt: file.uploadDate,
  status: file.status,
  sharedWith: file.sharedWith,
  tags: file.tags,
  fileUrl: file.fileUrl
});

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    const fileBase64 = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fileBase64, {
       resource_type: 'auto', // Support any correct resource type
       folder: 'docshare_uploads'
    });

    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = req.file.originalname;
    
    // Save to Database
    const newFile = await File.create({
      fileName,
      fileUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      owner: req.user._id,
      size: req.file.size,
      type: fileExtension || 'unknown',
      tags: req.body.tags ? JSON.parse(req.body.tags) : []
    });

    // Update User Files Count
    await User.findByIdAndUpdate(req.user._id, { $inc: { filesCount: 1 } });

    // Log Action
    await logAction({
      user: req.user.name,
      fileId: newFile._id,
      fileName: newFile.fileName,
      action: 'File upload',
      ip: req.ip
    });

    // Populate owner info for formatted response
    const populatedFile = await File.findById(newFile._id).populate('owner', 'name');

    res.status(201).json(formatFileResponse(populatedFile));

  } catch (error) {
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
};

const getMyFiles = async (req, res) => {
  try {
    // Both Partner and Admin might want different views, but based on route get my-files implies owner filter
    const files = await File.find({ owner: req.user._id }).populate('owner', 'name');

    res.status(200).json(files.map(formatFileResponse));
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve files', error: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Role-based check: Administrator can delete any file, Partner only their own
    if (file.owner.toString() !== req.user._id.toString() && req.user.role !== 'Administrator') {
      return res.status(403).json({ message: 'Not authorized to delete this file' });
    }

    // Remove from Cloudinary
    await cloudinary.uploader.destroy(file.cloudinaryPublicId);

    // Remove from Database
    await file.deleteOne();

    await User.findByIdAndUpdate(file.owner, { $inc: { filesCount: -1 } });

    // Log Action
    await logAction({
      user: req.user.name,
      fileId: file._id,
      fileName: file.fileName,
      action: 'Permission change', // Could be seen as permission change or new LogAction 'File deleted'
      ip: req.ip
    });

    res.status(200).json({ message: 'File removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete file', error: error.message });
  }
};

module.exports = {
  uploadFile,
  getMyFiles,
  deleteFile
};
