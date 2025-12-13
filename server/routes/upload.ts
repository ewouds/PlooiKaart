import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import express from 'express';
import multer from 'multer';
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
    console.log('[UPLOAD] user:', req.user);
    console.log('[UPLOAD] has file:', !!req.file);
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    let rawConn = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!rawConn) {
      console.error('[UPLOAD] AZURE_STORAGE_CONNECTION_STRING is not set. Rejecting upload.');
      return res.status(503).json({
        error: 'StorageNotConfigured',
        message:
          'Azure storage is not configured on this server. Set the environment variable `AZURE_STORAGE_CONNECTION_STRING` (see .env.example / README) or run the Azure Storage emulator for local development. The upload endpoint is unavailable until configured.',
      });
    }

    // Be lenient: strip surrounding quotes if someone put them in the .env
    rawConn = rawConn.replace(/^['"]|['"]$/g, '').trim();

    // If someone pasted extra garbage before the URL (we've seen this), try to find the first 'http'
    const httpIndex = rawConn.search(/https?:\/\//i);
    if (httpIndex > 0) {
      console.warn('[UPLOAD] Trimming leading characters before http:// in AZURE_STORAGE_CONNECTION_STRING');
      rawConn = rawConn.substring(httpIndex);
    }

    // Log diagnostics: length and a masked preview (don't print keys/signatures).
    const masked = rawConn.replace(/sig=[^&\s]+/i, 'sig=***').replace(/AccountKey=[^;\s]+/i, 'AccountKey=***');
    console.log('[UPLOAD] AZURE_STORAGE_CONNECTION_STRING length:', rawConn.length);
    console.log('[UPLOAD] AZURE_STORAGE_CONNECTION_STRING preview:', masked.substring(0, 200));
    console.log('[UPLOAD] startsWith https?:', /^https?:\/\//i.test(rawConn));

    let blobServiceClient: BlobServiceClient;
    try {
      // Strict handling: full HTTPS SAS URL (must parse as valid URL), or a classic connection string
      if (/^https?:\/\//i.test(rawConn)) {
        // Validate URL
        try {
          // This will throw on invalid URL
          // eslint-disable-next-line no-unused-vars
          const u = new URL(rawConn);
        } catch (e) {
          throw new Error('SAS URL is not a valid URL');
        }
        blobServiceClient = new BlobServiceClient(rawConn);
      } else if (/AccountName=|DefaultEndpointsProtocol=/i.test(rawConn)) {
        blobServiceClient = BlobServiceClient.fromConnectionString(rawConn);
      } else {
        throw new Error('Unknown storage configuration format');
      }
    } catch (err) {
      console.error('[UPLOAD] Invalid AZURE_STORAGE_CONNECTION_STRING or SAS URL', err);
      return res.status(503).json({
        error: 'StorageInvalid',
        message:
          'The provided AZURE_STORAGE_CONNECTION_STRING appears invalid. Provide either a full HTTPS SAS URL (https://<account>.blob.core.windows.net/<container>?sv=...) or a connection string (DefaultEndpointsProtocol=...). Remove surrounding quotes from the env value.',
      });
    }

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
