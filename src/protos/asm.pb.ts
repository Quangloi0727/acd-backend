/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "com.metech.acd";

export interface GetAvailableAgentsRequest {
  tentantId: number;
}

export interface GetAvailableAgentsResponse {
  agents: Agent[];
}

export interface Agent {
  agentId: number;
}

export const COM_METECH_ACD_PACKAGE_NAME = "com.metech.acd";

export interface AsmServiceClient {
  getAvailableAgents(request: GetAvailableAgentsRequest): Observable<GetAvailableAgentsResponse>;
}

export interface AsmServiceController {
  getAvailableAgents(
    request: GetAvailableAgentsRequest,
  ): Promise<GetAvailableAgentsResponse> | Observable<GetAvailableAgentsResponse> | GetAvailableAgentsResponse;
}

export function AsmServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getAvailableAgents"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("AsmService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("AsmService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const ASM_SERVICE_NAME = "AsmService";
