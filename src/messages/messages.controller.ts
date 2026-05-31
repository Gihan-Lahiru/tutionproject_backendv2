import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';

@Controller('api/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  async createMessage(@Req() req, @Body('message') message: string) {
    return this.messagesService.create(req.user.id, message);
  }

  @Get('my-messages')
  async getMyMessages(@Req() req) {
    return this.messagesService.findByStudent(req.user.id);
  }

  @Get()
  async getAllMessages() {
    return this.messagesService.findAll();
  }

  @Put(':id/reply')
  async replyMessage(@Param('id') id: string, @Body('reply') reply: string) {
    return this.messagesService.reply(id, reply);
  }
}
