import { Module } from '@nestjs/common';
import { PdfWatermarkService } from './pdf-watermark.service';

@Module({
  providers: [PdfWatermarkService],
  exports: [PdfWatermarkService],
})
export class PdfWatermarkModule {}