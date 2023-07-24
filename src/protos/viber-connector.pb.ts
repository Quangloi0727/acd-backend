/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "com.metech.acd";

export interface SendMessageToViberRequest {
  message: MessageForViber | undefined;
  attachments: AttachmentsForViber | undefined;
}

export interface MessageForViber {
  cloudAgentId: number;
  cloudTenantId: number;
  conversationId: string;
  messageType: string;
  text: string;
}

export interface AttachmentsForViber {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Uint8Array;
  size: number;
}

export interface AttachmentsResponseForViber {
  fileName: string;
}

export interface SendMessageToViberResponse {
  cloudAgentId: number;
  cloudTenantId: number;
  conversationId: string;
  messageType: string;
  text: string;
  attachment: AttachmentsResponseForViber | undefined;
}

export const COM_METECH_ACD_PACKAGE_NAME = "com.metech.acd";

export interface ViberConnectorServiceClient {
  sendMessageToViber(request: SendMessageToViberRequest): Observable<SendMessageToViberResponse>;
}

export interface ViberConnectorServiceController {
  sendMessageToViber(
    request: SendMessageToViberRequest,
  ): Promise<SendMessageToViberResponse> | Observable<SendMessageToViberResponse> | SendMessageToViberResponse;
}

export function ViberConnectorServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["sendMessageToViber"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("ViberConnectorService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("ViberConnectorService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const VIBER_CONNECTOR_SERVICE_NAME = "ViberConnectorService";
