/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "com.metech.acd";

export interface AssignAgentToConversationRequest {
  tenantId: number;
  conversationId: string;
}

export interface AssignAgentToConversationResponse {
  tenantId: number;
  conversationId: string;
  agentId: number;
}

export const COM_METECH_ACD_PACKAGE_NAME = "com.metech.acd";

export interface AgentAssignmentServiceClient {
  assignAgentToConversation(request: AssignAgentToConversationRequest): Observable<AssignAgentToConversationResponse>;
}

export interface AgentAssignmentServiceController {
  assignAgentToConversation(
    request: AssignAgentToConversationRequest,
  ):
    | Promise<AssignAgentToConversationResponse>
    | Observable<AssignAgentToConversationResponse>
    | AssignAgentToConversationResponse;
}

export function AgentAssignmentServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["assignAgentToConversation"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("AgentAssignmentService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("AgentAssignmentService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const AGENT_ASSIGNMENT_SERVICE_NAME = "AgentAssignmentService";
