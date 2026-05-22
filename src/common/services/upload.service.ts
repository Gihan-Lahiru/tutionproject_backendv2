import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { setupCloudinary } from '../../config/cloudinary.config';

@Injectable()
export class UploadService {
  constructor() {
    setupCloudinary();
  }

  async uploadFile(file: any, folder: string) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      stream.end(file.buffer);
    });
  }

  async deleteFile(publicId: string) {
    return cloudinary.uploader.destroy(publicId);
  }
}
