/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "com.metech.acd";

export interface SendMessageToFacebookRequest {
  message: MessageForFacebook | undefined;
  attachments: AttachmentsForFacebook | undefined;
}

export interface MessageForFacebook {
  cloudAgentId: number;
  cloudTenantId: number;
  conversationId: string;
  messageType: string;
  text: string;
}

export interface AttachmentsForFacebook {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Uint8Array;
  size: number;
}

export interface AttachmentsResponseForFacebook {
  fileName: string;
}

export interface SendMessageToFacebookResponse {
  cloudAgentId: number;
  cloudTenantId: number;
  conversationId: string;
  messageType: string;
  text: string;
  attachment: AttachmentsResponseForFacebook | undefined;
}

export const COM_METECH_ACD_PACKAGE_NAME = "com.metech.acd";

export interface FacebookConnectorServiceClient {
  sendMessageToFacebook(request: SendMessageToFacebookRequest): Observable<SendMessageToFacebookResponse>;
}

export interface FacebookConnectorServiceController {
  sendMessageToFacebook(
    request: SendMessageToFacebookRequest,
  ): Promise<SendMessageToFacebookResponse> | Observable<SendMessageToFacebookResponse> | SendMessageToFacebookResponse;
}

export function FacebookConnectorServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["sendMessageToFacebook"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("FacebookConnectorService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("FacebookConnectorService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const FACEBOOK_CONNECTOR_SERVICE_NAME = "FacebookConnectorService";
