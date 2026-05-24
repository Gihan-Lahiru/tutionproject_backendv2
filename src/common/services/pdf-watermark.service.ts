import { Injectable, Logger } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

@Injectable()
export class PdfWatermarkService {
  private readonly logger = new Logger(PdfWatermarkService.name);

  async addWatermarkToPdfBuffer(
    pdfBuffer: Buffer,
    studentName: string,
    studentGrade: string,
  ): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const pages = pdfDoc.getPages();
      const name = studentName || 'Student';
      const grade = studentGrade ? `Grade ${studentGrade}` : 'Student';
      const watermarkText = studentGrade ? `${name} | ${grade}` : name;
      const footerText = 'Learn with Maleesha';

      for (const page of pages) {
        const { width, height } = page.getSize();
        
        // --- Central Watermarks (Horizontal) ---
        const textSize = 40;
        const textWidth = font.widthOfTextAtSize(watermarkText, textSize);
        
        // We will place horizontal watermarks at 25%, 50%, and 75% height
        const yPositions = [height * 0.75, height * 0.5, height * 0.25];
        
        for (const y of yPositions) {
            const x = (width / 2) - (textWidth / 2);
            page.drawText(watermarkText, {
              x,
              y,
              size: textSize,
              font,
              color: rgb(0.5, 0.5, 0.5),
              opacity: 0.2, // light opacity
              rotate: degrees(0), // horizontal only
            });
        }
        
        // --- Footer Text ---
        const footerSize = 12;
        const footerWidth = font.widthOfTextAtSize(footerText, footerSize);
        page.drawText(footerText, {
          x: (width / 2) - (footerWidth / 2),
          y: 30, // bottom center
          size: footerSize,
          font,
          color: rgb(0.3, 0.3, 0.3),
          opacity: 0.5,
        });
      }

      const modifiedPdfBytes = await pdfDoc.save();
      return Buffer.from(modifiedPdfBytes);
    } catch (err) {
      this.logger.error('Failed to parse or add watermark to PDF: ' + err.message);
      // Return the original buffer if pdf-lib fails (e.g., if it's protected or not a valid PDF)
      return pdfBuffer;
    }
  }

  async addWatermarkToPdfUrl(
    fileUrl: string,
    studentName: string,
    studentGrade: string,
  ): Promise<Buffer | null> {
    try {
      if (fileUrl.includes('/uploads/')) {
        // Optimisation for local files to avoid network loops
        const relativePath = fileUrl.split('/uploads/')[1];
        const absolutePath = require('path').join(process.cwd(), 'uploads', relativePath);
        if (require('fs').existsSync(absolutePath)) {
          const pdfBytes = require('fs').readFileSync(absolutePath);
          return this.addWatermarkToPdfBuffer(pdfBytes, studentName, studentGrade);
        }
      }

      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file from ${fileUrl}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const pdfBytes = Buffer.from(arrayBuffer);

      return this.addWatermarkToPdfBuffer(pdfBytes, studentName, studentGrade);
    } catch (err) {
      this.logger.error('Error fetching/watermarking remote PDF: ' + err.message);
      return null;
    }
  }
}
