/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { GetAvailableAgentsRequest, GetAvailableAgentsResponse } from "./asm.pb";

export const protobufPackage = "com.metech.acd";

export const COM_METECH_ACD_PACKAGE_NAME = "com.metech.acd";

export interface AsmEmailServiceClient {
  getAvailableAgents(request: GetAvailableAgentsRequest): Observable<GetAvailableAgentsResponse>;
}

export interface AsmEmailServiceController {
  getAvailableAgents(
    request: GetAvailableAgentsRequest,
  ): Promise<GetAvailableAgentsResponse> | Observable<GetAvailableAgentsResponse> | GetAvailableAgentsResponse;
}

export function AsmEmailServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getAvailableAgents"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("AsmEmailService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("AsmEmailService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const ASM_EMAIL_SERVICE_NAME = "AsmEmailService";
