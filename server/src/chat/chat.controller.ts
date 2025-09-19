import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChat(
    @Request() req,
    @Body(ValidationPipe) createChatDto: CreateChatDto,
  ) {
    return this.chatService.createChat(req.user.userId, createChatDto);
  }

  @Get()
  async getUserChats(@Request() req) {
    return this.chatService.getUserChats(req.user.userId);
  }

  @Get(':chatId')
  async getChat(@Param('chatId') chatId: string, @Request() req) {
    return this.chatService.getChat(chatId, req.user.userId);
  }

  @Post(':chatId/messages')
  async sendMessage(
    @Param('chatId') chatId: string,
    @Request() req,
    @Body(ValidationPipe) sendMessageDto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(chatId, req.user.userId, sendMessageDto);
  }

  @Delete(':chatId')
  async deleteChat(@Param('chatId') chatId: string, @Request() req) {
    return this.chatService.deleteChat(chatId, req.user.userId);
  }
}