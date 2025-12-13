import express from 'express';
import multer from 'multer';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Multer memory storage to avoid persisting files on disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post('/upload', authenticateToken, upload.single('file'), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) return res.status(500).json({ message: 'Storage not configured' });

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerName = 'plooiimages';
    const containerClient: ContainerClient = blobServiceClient.getContainerClient(containerName);

    // ensure container exists
    await containerClient.createIfNotExists({ access: 'container' });

    const originalName = req.file.originalname || 'upload';
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const blobName = `${req.user?.userId || 'anon'}-${Date.now()}-${uuidv4()}-${safeName}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype },
    });

    const blobUrl = blockBlobClient.url;
    res.json({ url: blobUrl });
  } catch (err) {
    console.error('Upload error', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

export default router;
