/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "com.metech.acd";

export interface getListAgentByAppIdRequest {
  tenantId: number;
  applicationId: string;
}

export interface getListAgentByAppIdResponse {
  agentIds: number[];
}

export const COM_METECH_ACD_PACKAGE_NAME = "com.metech.acd";

export interface SocialConfigurationServiceClient {
  getListAgentByAppId(request: getListAgentByAppIdRequest): Observable<getListAgentByAppIdResponse>;
}

export interface SocialConfigurationServiceController {
  getListAgentByAppId(
    request: getListAgentByAppIdRequest,
  ): Promise<getListAgentByAppIdResponse> | Observable<getListAgentByAppIdResponse> | getListAgentByAppIdResponse;
}

export function SocialConfigurationServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getListAgentByAppId"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("SocialConfigurationService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("SocialConfigurationService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const SOCIAL_CONFIGURATION_SERVICE_NAME = "SocialConfigurationService";
