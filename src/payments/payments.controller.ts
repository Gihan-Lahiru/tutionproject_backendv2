import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const receiptsDir = join(process.cwd(), 'uploads', 'receipts');
if (!existsSync(receiptsDir)) {
  mkdirSync(receiptsDir, { recursive: true });
}

@Controller('api/payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('upload-receipt')
  @UseInterceptors(
    FileInterceptor('receipt', {
      storage: diskStorage({
        destination: receiptsDir,
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname).toLowerCase();
          cb(null, `receipt_${Date.now()}${extension}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const isValid = /^(image\/|application\/pdf)/.test(file.mimetype);
        cb(isValid ? null : new BadRequestException('Invalid file type'), isValid);
      },
    }),
  )
  async uploadReceipt(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { note?: string; amount?: string; month?: string; year?: string },
  ) {
    if (!file) {
      throw new BadRequestException('Receipt file is required');
    }
    const receiptUrl = `/uploads/receipts/${file.filename}`;
    return this.paymentsService.uploadReceipt(req.user.id, receiptUrl, body);
  }

  @Put(':id/approve')
  async approvePayment(@Param('id') id: string) {
    return this.paymentsService.approvePayment(id);
  }

  @Put(':id/reject')
  async rejectPayment(@Param('id') id: string) {
    return this.paymentsService.rejectPayment(id);
  }

  @Post()
  async create(@Body() createPaymentDto: any) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.paymentsService.findByUser(userId);
  }

  @Get('my-payments')
  async getMyPayments(@Req() req) {
    return this.paymentsService.findByUser(req.user.id);
  }

  @Get('receipts/pending')
  async getPendingReceipts() {
    return this.paymentsService.findPendingReceipts();
  }

  @Get()
  async findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePaymentDto: any) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() statusDto: { status: string }) {
    return this.paymentsService.updateStatus(id, statusDto.status);
  }
}
