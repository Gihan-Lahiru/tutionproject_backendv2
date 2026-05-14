import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';

@Controller('api/payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

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
