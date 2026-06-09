import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ftp from 'basic-ftp';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { Readable } from 'stream';

@Injectable()
export class HostingerStorageService {
  private readonly logger = new Logger(HostingerStorageService.name);

  constructor(private configService: ConfigService) {}

  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    subFolder: string,
  ): Promise<{ publicUrl: string; fileName: string; size: number }> {
    const client = new ftp.Client();
    client.ftp.verbose = false; // Set to true for debugging
    
    const host = this.configService.get<string>('HOSTINGER_FTP_HOST');
    const port = this.configService.get<number>('HOSTINGER_FTP_PORT', 21);
    const user = this.configService.get<string>('HOSTINGER_FTP_USERNAME');
    const password = this.configService.get<string>('HOSTINGER_FTP_PASSWORD');
    const basePath = this.configService.get<string>('HOSTINGER_UPLOAD_PATH', 'public_html/uploads');
    const baseUrl = this.configService.get<string>('PUBLIC_FILE_BASE_URL', 'https://yourdomain.com/uploads');

    if (!host || !user || !password) {
      this.logger.error('Missing FTP credentials in environment variables.');
      throw new InternalServerErrorException('Storage configuration error.');
    }

    const extension = extname(originalName || '').toLowerCase();
    const uniqueFileName = `${uuidv4()}${extension}`;
    
    const targetDirectory = `${basePath}/${subFolder}`.replace(/\/+/g, '/');
    const remoteFilePath = `${targetDirectory}/${uniqueFileName}`.replace(/\/+/g, '/');

    try {
      await client.access({
        host,
        port,
        user,
        password,
        secure: false // Set to true if FTPS is required
      });

      // Ensure directory exists
      await client.ensureDir(targetDirectory);

      // Upload file directly from memory buffer using a Readable stream
      const stream = Readable.from(fileBuffer);
      await client.uploadFrom(stream, uniqueFileName); // uploadFrom puts it in the current working directory which ensureDir navigated to
      
      const publicUrl = `${baseUrl}/${subFolder}/${uniqueFileName}`.replace(/([^:]\/)\/+/g, '$1');
      
      return {
        publicUrl,
        fileName: uniqueFileName,
        size: fileBuffer.length,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file to Hostinger via FTP: ${error.message}`, error.stack);
      throw new InternalServerErrorException('File upload failed. Please try again later.');
    } finally {
      client.close();
    }
  }
}
