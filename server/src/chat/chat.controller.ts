// src/chat/chat.controller.ts
import { Controller, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('doc')
  async docChat(@Req() req: Request, @Res() res: Response) {
    return this.chatService.docChat(req, res);
  }
}