/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "com.metech.acd";

export interface SendMessageToTelegramRequest {
  message: MessageForTelegram | undefined;
  attachments: AttachmentsForTelegram | undefined;
}

export interface MessageForTelegram {
  cloudAgentId: number;
  cloudTenantId: number;
  conversationId: string;
  messageType: string;
  text: string;
}

export interface AttachmentsForTelegram {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Uint8Array;
  size: number;
}

export interface AttachmentsResponseForTelegram {
  fileName: string;
}

export interface SendMessageToTelegramResponse {
  cloudAgentId: number;
  cloudTenantId: number;
  conversationId: string;
  messageType: string;
  text: string;
  attachment: AttachmentsResponseForTelegram | undefined;
}

export const COM_METECH_ACD_PACKAGE_NAME = "com.metech.acd";

export interface TelegramConnectorServiceClient {
  sendMessageToTelegram(request: SendMessageToTelegramRequest): Observable<SendMessageToTelegramResponse>;
}

export interface TelegramConnectorServiceController {
  sendMessageToTelegram(
    request: SendMessageToTelegramRequest,
  ): Promise<SendMessageToTelegramResponse> | Observable<SendMessageToTelegramResponse> | SendMessageToTelegramResponse;
}

export function TelegramConnectorServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["sendMessageToTelegram"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("TelegramConnectorService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("TelegramConnectorService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const TELEGRAM_CONNECTOR_SERVICE_NAME = "TelegramConnectorService";
