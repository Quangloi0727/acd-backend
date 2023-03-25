/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "chat_session_registry";

export interface RegisterRequest {
  chatId: string;
  tenantId: number;
}

export interface RegisterResponse {
  sessionId: string;
  error: string[];
}

export const CHAT_SESSION_REGISTRY_PACKAGE_NAME = "chat_session_registry";

export interface ChatSessionRegistryServiceClient {
  register(request: RegisterRequest): Observable<RegisterResponse>;
}

export interface ChatSessionRegistryServiceController {
  register(request: RegisterRequest): Promise<RegisterResponse> | Observable<RegisterResponse> | RegisterResponse;
}

export function ChatSessionRegistryServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["register"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("ChatSessionRegistryService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("ChatSessionRegistryService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const CHAT_SESSION_REGISTRY_SERVICE_NAME = "ChatSessionRegistryService";
