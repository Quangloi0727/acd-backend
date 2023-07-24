/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "com.metech.acd";

export interface SendMessageToWhatSappRequest {
  message: MessageForWhatSapp | undefined;
  attachments: AttachmentsForWhatSapp | undefined;
}

export interface MessageForWhatSapp {
  cloudAgentId: number;
  cloudTenantId: number;
  conversationId: string;
  messageType: string;
  text: string;
}

export interface AttachmentsForWhatSapp {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Uint8Array;
  size: number;
}

export interface AttachmentsResponseForWhatSapp {
  fileName: string;
}

export interface SendMessageToWhatSappResponse {
  cloudAgentId: number;
  cloudTenantId: number;
  conversationId: string;
  messageType: string;
  text: string;
  attachment: AttachmentsResponseForWhatSapp | undefined;
}

export const COM_METECH_ACD_PACKAGE_NAME = "com.metech.acd";

export interface WhatSappConnectorServiceClient {
  sendMessageToWhatSapp(request: SendMessageToWhatSappRequest): Observable<SendMessageToWhatSappResponse>;
}

export interface WhatSappConnectorServiceController {
  sendMessageToWhatSapp(
    request: SendMessageToWhatSappRequest,
  ): Promise<SendMessageToWhatSappResponse> | Observable<SendMessageToWhatSappResponse> | SendMessageToWhatSappResponse;
}

export function WhatSappConnectorServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["sendMessageToWhatSapp"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("WhatSappConnectorService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("WhatSappConnectorService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const WHAT_SAPP_CONNECTOR_SERVICE_NAME = "WhatSappConnectorService";
