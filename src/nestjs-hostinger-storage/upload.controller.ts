import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiConsumes, ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { HostingerStorageService } from './hostinger-storage.service';
import { FileUploadDto } from './dto/upload.dto';

const createDocumentValidator = () => {
  return new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // 20MB
      new FileTypeValidator({
        // Accepts common document formats
        fileType: /.(pdf|doc|docx|ppt|pptx|xls|xlsx)$/i,
      }),
    ],
  });
};

@ApiTags('Hostinger Uploads')
@Controller('upload')
export class UploadController {
  constructor(private readonly storageService: HostingerStorageService) {}

  @Post('profile-picture')
  @ApiOperation({ summary: 'Upload a profile picture to Hostinger' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Profile picture (jpg, jpeg, png) - Max 5MB',
    type: FileUploadDto,
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadProfilePicture(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /.(jpg|jpeg|png)$/i }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.storageService.uploadFile(file.buffer, file.originalname, 'profile-pictures');
  }

  @Post('note')
  @ApiOperation({ summary: 'Upload a note document to Hostinger' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Note document (pdf, doc, docx, ppt, pptx, xls, xlsx) - Max 20MB',
    type: FileUploadDto,
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadNote(
    @UploadedFile(createDocumentValidator())
    file: Express.Multer.File,
  ) {
    return this.storageService.uploadFile(file.buffer, file.originalname, 'notes');
  }

  @Post('assignment')
  @ApiOperation({ summary: 'Upload an assignment to Hostinger' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Assignment document (pdf, doc, docx, ppt, pptx, xls, xlsx) - Max 20MB',
    type: FileUploadDto,
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadAssignment(
    @UploadedFile(createDocumentValidator())
    file: Express.Multer.File,
  ) {
    return this.storageService.uploadFile(file.buffer, file.originalname, 'assignments');
  }

  @Post('paper')
  @ApiOperation({ summary: 'Upload a past paper to Hostinger' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Past paper document (pdf, doc, docx, ppt, pptx, xls, xlsx) - Max 20MB',
    type: FileUploadDto,
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadPaper(
    @UploadedFile(createDocumentValidator())
    file: Express.Multer.File,
  ) {
    return this.storageService.uploadFile(file.buffer, file.originalname, 'papers');
  }

  @Post('resource')
  @ApiOperation({ summary: 'Upload a study resource to Hostinger' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Study resource document (pdf, doc, docx, ppt, pptx, xls, xlsx) - Max 20MB',
    type: FileUploadDto,
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadResource(
    @UploadedFile(createDocumentValidator())
    file: Express.Multer.File,
  ) {
    return this.storageService.uploadFile(file.buffer, file.originalname, 'resources');
  }

}
