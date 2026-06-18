import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuid } from 'uuid';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class UploadService {
  private logger = new Logger(UploadService.name);
  private s3Client: S3Client | null = null;
  private useS3 = false;
  private bucketName = '';

  constructor() {
    const endpoint = process.env.DO_SPACES_ENDPOINT;
    const key = process.env.DO_SPACES_KEY;
    const secret = process.env.DO_SPACES_SECRET;
    const bucket = process.env.DO_SPACES_BUCKET;
    const region = process.env.DO_SPACES_REGION || 'us-east-1';

    if (endpoint && key && secret && bucket) {
      try {
        this.s3Client = new S3Client({
          endpoint,
          region,
          credentials: {
            accessKeyId: key,
            secretAccessKey: secret,
          },
        });
        this.useS3 = true;
        this.bucketName = bucket;
        this.logger.log(`DigitalOcean Spaces storage initialized. Bucket: ${bucket}, Endpoint: ${endpoint}`);
      } catch (err) {
        this.logger.error(`Failed to initialize DigitalOcean Spaces client: ${err.message}. Falling back to local storage.`);
      }
    } else {
      this.logger.log('DigitalOcean Spaces credentials not fully configured. Using local disk storage.');
    }
  }

  async uploadFile(file: any, folder: string) {
    // file: { originalname, buffer, mimetype }
    const extMatch = (file.originalname || '').match(/\.([a-z0-9]+)$/i);
    const ext = extMatch ? `.${extMatch[1]}` : '';
    const filename = `${uuid()}${ext}`;
    const originalName = String(file.originalname || filename).trim();
    const relativePath = `${folder}/${filename}`.replace(/\/+/g, '/');

    if (this.useS3 && this.s3Client) {
      try {
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: relativePath,
          Body: file.buffer,
          ContentType: file.mimetype || 'application/octet-stream',
          ACL: 'public-read',
        });

        await this.s3Client.send(command);

        const endpointUrl = new URL(process.env.DO_SPACES_ENDPOINT);
        const secure_url = `https://${this.bucketName}.${endpointUrl.hostname}/${relativePath}`;

        this.logger.log(`File uploaded successfully to DigitalOcean Spaces: ${secure_url}`);
        return { secure_url, public_id: relativePath, original_name: originalName };
      } catch (err) {
        this.logger.error(`DigitalOcean Spaces upload failed: ${err.message}. Trying local storage fallback...`);
      }
    }

    // Local storage fallback
    const uploadsRoot = join(process.cwd(), 'uploads');
    const targetFolder = join(uploadsRoot, folder);
    await fs.mkdir(targetFolder, { recursive: true });

    const absolutePath = join(uploadsRoot, relativePath);
    await fs.writeFile(absolutePath, file.buffer);

    const host = process.env.APP_HOST || `http://localhost:5000`;
    const secure_url = `${host}/uploads/${relativePath}`;

    this.logger.log(`File uploaded locally: ${secure_url}`);
    return { secure_url, public_id: relativePath, original_name: originalName };
  }

  async deleteFile(publicId: string) {
    if (this.useS3 && this.s3Client && !publicId.startsWith('local:')) {
      try {
        const command = new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: publicId,
        });
        await this.s3Client.send(command);
        this.logger.log(`Deleted file from DigitalOcean Spaces: ${publicId}`);
        return { result: 'deleted' };
      } catch (err) {
        this.logger.warn(`Failed to delete from DigitalOcean Spaces: ${publicId}: ${err.message}`);
        // Fall through to try deleting locally if needed
      }
    }

    try {
      const uploadsRoot = join(process.cwd(), 'uploads');
      const absolutePath = join(uploadsRoot, publicId.replace(/^local:/, ''));
      await fs.unlink(absolutePath);
      this.logger.log(`Deleted local file: ${publicId}`);
      return { result: 'deleted' };
    } catch (err) {
      this.logger.warn(`deleteFile failed for ${publicId}: ${err?.message || err}`);
      return { result: 'not_found' };
    }
  }
}

