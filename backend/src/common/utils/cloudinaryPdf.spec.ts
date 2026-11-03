import {
  validatePdf,
  uploadPdfToCloudinary,
  pdfReadUrl,
} from './cloudinaryPdf';
import cloudinary from 'src/config/cloudinary';
import { Writable } from 'stream';
jest.mock('src/config/cloudinary', () => ({
  __esModule: true,
  default: {
    uploader: { upload_stream: jest.fn(), destroy: jest.fn() },
    utils: {
      private_download_url: jest.fn(() => 'https://example.com/signed.pdf'),
    },
  },
}));
const file = (content = '%PDF-1.7\nbody\n%%EOF') =>
  ({
    mimetype: 'application/pdf',
    originalname: 'book.pdf',
    buffer: Buffer.from(content),
    size: Buffer.byteLength(content),
  }) as Express.Multer.File;
describe('Cloudinary PDF storage', () => {
  it('accepts PDF and rejects missing, spoofed and oversized files', () => {
    expect(() => validatePdf(file())).not.toThrow();
    expect(() => validatePdf(undefined)).toThrow('PDF file is required');
    expect(() => validatePdf(file('<html>not PDF</html>'))).toThrow(
      'Only PDF files are allowed',
    );
    expect(() => validatePdf({ ...file(), mimetype: 'image/png' })).toThrow(
      'Only PDF files are allowed',
    );
    expect(() =>
      validatePdf({ ...file(), size: 10 * 1024 * 1024 + 1 }),
    ).toThrow('PDF must be 10 MB or smaller');
  });
  it('uploads original PDF bytes as authenticated raw asset without image transformations', async () => {
    let bytes = Buffer.alloc(0);
    const upload = jest.mocked(cloudinary.uploader.upload_stream);
    upload.mockImplementation((...args: unknown[]) => {
      const [options, callback] = args as [
        unknown,
        (error: undefined, result: { public_id: string }) => void,
      ];
      expect(options).toMatchObject({
        resource_type: 'raw',
        type: 'authenticated',
        folder: 'ebooks',
      });
      expect(options).not.toHaveProperty('transformation');
      return new Writable({
        write(chunk: Buffer, _encoding, done) {
          bytes = Buffer.concat([bytes, chunk]);
          done();
        },
        final(done) {
          callback(undefined, { public_id: 'ebooks/generated.pdf' });
          done();
        },
      }) as never;
    });
    await expect(uploadPdfToCloudinary(file())).resolves.toBe(
      'ebooks/generated.pdf',
    );
    expect(bytes).toEqual(file().buffer);
  });
  it('returns temporary inline URL for authenticated raw asset', () => {
    expect(pdfReadUrl('ebooks/generated.pdf')).toBe(
      'https://example.com/signed.pdf',
    );
    expect(cloudinary.utils.private_download_url).toHaveBeenCalledWith(
      'ebooks/generated.pdf',
      '',
      expect.objectContaining({
        resource_type: 'raw',
        type: 'authenticated',
        attachment: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expires_at: expect.any(Number),
      }),
    );
  });
});
