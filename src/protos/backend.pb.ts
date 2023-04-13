/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "com.metech.acd";

export interface GetConversationHistoryRequest {
  tenantId: number;
  conversationId: string;
  skip: number;
  take: number;
}

export interface GetConversationHistoryResponse {
  conversationId: string;
  messages: Conversation[];
  total: number;
}

export interface Conversation {
  conversationId: string;
  senderId: string;
  senderName: string;
  applicationId: string;
  message: string;
  messageType: string;
  receivedTime: number;
}

export const COM_METECH_ACD_PACKAGE_NAME = "com.metech.acd";

export interface ChatSessionManagerServiceClient {
  getConversationHistory(request: GetConversationHistoryRequest): Observable<GetConversationHistoryResponse>;
}

export interface ChatSessionManagerServiceController {
  getConversationHistory(
    request: GetConversationHistoryRequest,
  ):
    | Promise<GetConversationHistoryResponse>
    | Observable<GetConversationHistoryResponse>
    | GetConversationHistoryResponse;
}

export function ChatSessionManagerServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getConversationHistory"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("ChatSessionManagerService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("ChatSessionManagerService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const CHAT_SESSION_MANAGER_SERVICE_NAME = "ChatSessionManagerService";
