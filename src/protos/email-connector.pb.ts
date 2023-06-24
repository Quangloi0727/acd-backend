/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "com.metech.acd";

export interface Email {
  sender: string;
  email: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
}

export interface Attachment {
  cid: string;
  name: string;
  absPath: string;
  relPath: string;
  buffer: Uint8Array;
  inline: boolean;
}

export interface SendEmailRequest {
  message: Email | undefined;
  attachments: Attachment[];
}

export interface SendEmailResponse {
  messageId: string;
  accepted: string[];
  rejected: string[];
}

export interface EmailFetchStatusRequest {
  email: string;
}

export interface EmailFetchStatusResponse {
  email: string;
  lastFetch: number;
  lastFetchCount: number;
  lastFetchUid: number;
}

export interface EmailConfigSyncRequest {
  email: string;
}

export interface EmailConfigSyncResponse {
  success: boolean;
  message: string;
}

export const COM_METECH_ACD_PACKAGE_NAME = "com.metech.acd";

export interface EmailServiceClient {
  sendEmail(request: SendEmailRequest): Observable<SendEmailResponse>;

  fetchStatus(request: EmailFetchStatusRequest): Observable<EmailFetchStatusResponse>;

  syncConfig(request: EmailConfigSyncRequest): Observable<EmailConfigSyncResponse>;
}

export interface EmailServiceController {
  sendEmail(request: SendEmailRequest): Promise<SendEmailResponse> | Observable<SendEmailResponse> | SendEmailResponse;

  fetchStatus(
    request: EmailFetchStatusRequest,
  ): Promise<EmailFetchStatusResponse> | Observable<EmailFetchStatusResponse> | EmailFetchStatusResponse;

  syncConfig(
    request: EmailConfigSyncRequest,
  ): Promise<EmailConfigSyncResponse> | Observable<EmailConfigSyncResponse> | EmailConfigSyncResponse;
}

export function EmailServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["sendEmail", "fetchStatus", "syncConfig"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("EmailService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("EmailService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const EMAIL_SERVICE_NAME = "EmailService";
