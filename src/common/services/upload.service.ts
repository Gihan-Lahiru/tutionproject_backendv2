import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { join, basename, extname } from 'path';
import { setupCloudinary } from '../../config/cloudinary.config';

@Injectable()
export class UploadService {
  constructor() {
    setupCloudinary();
  }

  private async uploadLocally(file: any, folder: string) {
    const relativeFolder = folder.replace(/^\/+|\/+$/g, '');
    const safeName = basename(file?.originalname || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}-${safeName || `file${extname(file?.originalname || '')}`}`;
    const uploadDir = join(process.cwd(), 'uploads', relativeFolder);
    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, file.buffer);

    const publicPath = `/uploads/${relativeFolder}/${fileName}`.replace(/\\/g, '/');
    return {
      secure_url: publicPath,
      public_id: `local:${relativeFolder}/${fileName}`,
    };
  }

  async uploadFile(file: any, folder: string) {
    const hasCloudinaryConfig = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET,
    );

    if (!hasCloudinaryConfig) {
      return this.uploadLocally(file, folder);
    }

    try {
      return await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        stream.end(file.buffer);
      });
    } catch (error) {
      return this.uploadLocally(file, folder);
    }
  }

  async deleteFile(publicId: string) {
    if (publicId?.startsWith('local:')) {
      const relativePath = publicId.replace(/^local:/, '');
      const filePath = join(process.cwd(), 'uploads', ...relativePath.split('/'));

      try {
        await unlink(filePath);
      } catch (error) {
        // Ignore missing local files so deletes stay idempotent.
      }

      return { result: 'ok' };
    }

    return cloudinary.uploader.destroy(publicId);
  }
}
