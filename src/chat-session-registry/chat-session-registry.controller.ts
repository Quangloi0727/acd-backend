import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CHAT_SESSION_REGISTRY_SERVICE_NAME,
  RegisterRequest,
  RegisterResponse,
} from 'src/protos/chat-session-registry.pb';

@Controller()
export class ChatSessionRegistryController {
  @GrpcMethod(CHAT_SESSION_REGISTRY_SERVICE_NAME, 'Register')
  private async register(request: RegisterRequest): Promise<RegisterResponse> {
    return { error: null, sessionId: '' };
  }
}
