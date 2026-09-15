import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const imageBase64 = req.body.imageBase64 || req.body.base64Data || req.body.image;
    const { filename = 'image.png', contentType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'No image data provided' });
    }

    // Extract base64 payload if it includes data URI header
    const matches = imageBase64.match(/^data:([A-Za-z0-9\-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = 'png';
    let detectedMime = contentType || 'image/png';

    if (matches && matches.length === 3) {
      detectedMime = matches[1].toLowerCase();
      // Strict MIME validation: must be an image
      if (!detectedMime.startsWith('image/') || !ALLOWED_IMAGE_MIMES.includes(detectedMime)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type '${detectedMime}'. Only image files (JPEG, PNG, WEBP, GIF) are allowed.`,
        });
      }

      if (detectedMime.includes('jpeg') || detectedMime.includes('jpg')) ext = 'jpg';
      else if (detectedMime.includes('webp')) ext = 'webp';
      else if (detectedMime.includes('gif')) ext = 'gif';
      else ext = 'png';

      buffer = Buffer.from(matches[2], 'base64');
    } else {
      // If client explicitly passed contentType, validate it
      if (contentType) {
        const lowerType = contentType.toLowerCase();
        if (!lowerType.startsWith('image/') || !ALLOWED_IMAGE_MIMES.includes(lowerType)) {
          return res.status(400).json({
            success: false,
            message: `Invalid file type '${contentType}'. Only image files (JPEG, PNG, WEBP, GIF) are allowed.`,
          });
        }
        if (lowerType.includes('jpeg') || lowerType.includes('jpg')) ext = 'jpg';
        else if (lowerType.includes('webp')) ext = 'webp';
        else if (lowerType.includes('gif')) ext = 'gif';
      }
      buffer = Buffer.from(imageBase64, 'base64');
    }

    // Strict Size validation: maximum 10MB
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      return res.status(400).json({
        success: false,
        message: `File exceeds maximum 10MB size limit (Received: ${(buffer.length / (1024 * 1024)).toFixed(2)}MB).`,
      });
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
      mimeType: detectedMime,
    });
  } catch (error: any) {
    console.error('Error handling upload:', error);
    return res.status(500).json({ success: false, message: error.message || 'Image upload failed' });
  }
};
