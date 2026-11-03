import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import cloudinary from 'src/config/cloudinary';

export const PDF_MAX_BYTES = 10 * 1024 * 1024;
export function validatePdf(
  file?: Express.Multer.File,
): asserts file is Express.Multer.File {
  if (!file) throw new BadRequestException('PDF file is required');
  if (file.size > PDF_MAX_BYTES || file.buffer.length > PDF_MAX_BYTES)
    throw new BadRequestException('PDF must be 10 MB or smaller');
  if (
    file.mimetype !== 'application/pdf' ||
    file.buffer.subarray(0, 5).toString() !== '%PDF-'
  ) {
    throw new BadRequestException('Only PDF files are allowed');
  }
}

export async function uploadPdfToCloudinary(
  file: Express.Multer.File,
): Promise<string> {
  validatePdf(file);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'ebooks',
        public_id: randomUUID() + '.pdf',
        resource_type: 'raw',
        type: 'authenticated',
        timeout: 60000,
      },
      (error, result) => {
        if (error || !result)
          reject(
            new ServiceUnavailableException(
              'PDF storage is unavailable. Please try again.',
            ),
          );
        else resolve(result.public_id);
      },
    );
    stream.on('error', () =>
      reject(new ServiceUnavailableException('PDF upload failed')),
    );
    Readable.from(file.buffer).pipe(stream);
  });
}

export async function deletePdfFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: 'raw',
    type: 'authenticated',
    invalidate: true,
  });
}

export function pdfReadUrl(publicId: string): string {
  return cloudinary.utils.private_download_url(publicId, '', {
    resource_type: 'raw',
    type: 'authenticated',
    attachment: false,
    expires_at: Math.floor(Date.now() / 1000) + 15 * 60,
  });
}
