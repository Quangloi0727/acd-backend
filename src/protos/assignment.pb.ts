/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "com.metech.acd";

export interface DataRequest {
  tenantId: number;
  conversationId: string;
}

export interface DataResponse {
  tenantId: number;
  conversationId: string;
  agentId: string;
}

export const COM_METECH_ACD_PACKAGE_NAME = "com.metech.acd";

export interface RequestGetAgentAssignmentControllerClient {
  requestGetAgentAssignment(request: DataRequest): Observable<DataResponse>;
}

export interface RequestGetAgentAssignmentControllerController {
  requestGetAgentAssignment(request: DataRequest): Promise<DataResponse> | Observable<DataResponse> | DataResponse;
}

export function RequestGetAgentAssignmentControllerControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["requestGetAgentAssignment"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("RequestGetAgentAssignmentController", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("RequestGetAgentAssignmentController", method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}

export const REQUEST_GET_AGENT_ASSIGNMENT_CONTROLLER_SERVICE_NAME = "RequestGetAgentAssignmentController";
