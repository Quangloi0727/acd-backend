/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "com.metech.acd";

export interface SendMessageToZaloRequest {
  message: Message | undefined;
  attachments: Attachments | undefined;
}

export interface Message {
  cloudAgentId: number;
  cloudTenantId: number;
  conversationId: string;
  messageType: string;
  text: string;
}

export interface Attachments {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Uint8Array;
  size: number;
}

export interface AttachmentsResponse {
  fileName: string;
}

export interface SendMessageToZaloResponse {
  cloudAgentId: number;
  cloudTenantId: number;
  conversationId: string;
  messageType: string;
  text: string;
  attachment: AttachmentsResponse | undefined;
}

export const COM_METECH_ACD_PACKAGE_NAME = "com.metech.acd";

export interface ZaloConnectorServiceClient {
  sendMessageToZalo(request: SendMessageToZaloRequest): Observable<SendMessageToZaloResponse>;
}

export interface ZaloConnectorServiceController {
  sendMessageToZalo(
    request: SendMessageToZaloRequest,
  ): Promise<SendMessageToZaloResponse> | Observable<SendMessageToZaloResponse> | SendMessageToZaloResponse;
}

export function ZaloConnectorServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["sendMessageToZalo"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("ZaloConnectorService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("ZaloConnectorService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const ZALO_CONNECTOR_SERVICE_NAME = "ZaloConnectorService";
