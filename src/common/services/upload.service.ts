import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UploadService {
  private logger = new Logger(UploadService.name);

  async uploadFile(file: any, folder: string) {
    // file: { originalname, buffer }
    const uploadsRoot = join(process.cwd(), 'uploads')
    const targetFolder = join(uploadsRoot, folder)
    await fs.mkdir(targetFolder, { recursive: true })

    const extMatch = (file.originalname || '').match(/\.([a-z0-9]+)$/i)
    const ext = extMatch ? `.${extMatch[1]}` : ''
    const filename = `${uuid()}${ext}`
    const originalName = String(file.originalname || filename).trim()
    const relativePath = `${folder}/${filename}`
    const absolutePath = join(uploadsRoot, relativePath)

    await fs.writeFile(absolutePath, file.buffer)

    const host = process.env.APP_HOST || `http://localhost:5000`
    const secure_url = `${host}/uploads/${relativePath}`

    return { secure_url, public_id: relativePath, original_name: originalName }
  }

  async deleteFile(publicId: string) {
    try {
      const uploadsRoot = join(process.cwd(), 'uploads')
      const absolutePath = join(uploadsRoot, publicId)
      await fs.unlink(absolutePath)
      return { result: 'deleted' }
    } catch (err) {
      this.logger.warn(`deleteFile failed for ${publicId}: ${err?.message || err}`)
      return { result: 'not_found' }
    }
  }
}
