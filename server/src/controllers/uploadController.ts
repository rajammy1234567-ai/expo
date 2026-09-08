import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const { imageBase64, filename = 'image.png', contentType = 'image/png' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'No image data provided' });
    }

    // Extract base64 payload if it includes data URI header
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = 'png';

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('png')) ext = 'png';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(imageBase64, 'base64');
    }

    // Limit size to ~5MB
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'Image exceeds maximum 5MB size limit' });
    }

    const uniqueId = crypto.randomBytes(8).toString('hex');
    const safeFilename = `img_${Date.now()}_${uniqueId}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    fs.writeFileSync(filePath, buffer);

    const protocol = req.protocol;
    const host = req.get('host') || 'localhost:5000';
    const publicUrl = `${protocol}://${host}/uploads/${safeFilename}`;

    return res.json({
      success: true,
      url: publicUrl,
      filename: safeFilename,
      sizeBytes: buffer.length,
    });
  } catch (error: any) {
    console.error('Error handling upload:', error);
    return res.status(500).json({ success: false, message: error.message || 'Image upload failed' });
  }
};
