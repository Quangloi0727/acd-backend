/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "com.metech.acd";

export interface getListAgentByAppIdRequest {
  tenantId: number;
  applicationId: string;
}

export interface getListAgentByIdAgentGroupInCrmRequest {
  tenantId: number;
  idAgentGroupInCrm: number[];
}

export interface getListAgentResponse {
  agentIds: number[];
}

export const COM_METECH_ACD_PACKAGE_NAME = "com.metech.acd";

export interface SocialConfigurationServiceClient {
  getListAgentByAppId(request: getListAgentByAppIdRequest): Observable<getListAgentResponse>;

  getListAgentByIdAgentGroupInCrm(request: getListAgentByIdAgentGroupInCrmRequest): Observable<getListAgentResponse>;
}

export interface SocialConfigurationServiceController {
  getListAgentByAppId(
    request: getListAgentByAppIdRequest,
  ): Promise<getListAgentResponse> | Observable<getListAgentResponse> | getListAgentResponse;

  getListAgentByIdAgentGroupInCrm(
    request: getListAgentByIdAgentGroupInCrmRequest,
  ): Promise<getListAgentResponse> | Observable<getListAgentResponse> | getListAgentResponse;
}

export function SocialConfigurationServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getListAgentByAppId", "getListAgentByIdAgentGroupInCrm"];
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
