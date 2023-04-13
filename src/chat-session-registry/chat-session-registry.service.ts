import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatSessionRegistryService {
  async getSession(messageId: string) {
    return null;
  }

  async saveSession(chatSession: any) {
    return null;
  }
}
