import { Global, Module } from '@nestjs/common';
import { ClientGrpc, ClientsModule } from '@nestjs/microservices';
import {
  AGENT_ASSIGNMENT_SERVICE_NAME,
  AgentAssignmentServiceClient,
} from '../../protos/assignment.pb';
import { ASM_SERVICE_NAME, AsmServiceClient } from '../../protos/asm.pb';
import { assignmentClientOptions } from './assignment-client.options';
import { asmClientOptions } from './asm-client.options';

export const AssignmentClient = Symbol('ASSIGNMENT');
export const AsmClient = Symbol('ASM');

const assignmentClientFactory = {
  provide: AssignmentClient,
  useFactory: (client: ClientGrpc) => {
    return client.getService<AgentAssignmentServiceClient>(
      AGENT_ASSIGNMENT_SERVICE_NAME,
    );
  },
  inject: [AGENT_ASSIGNMENT_SERVICE_NAME],
};

const asmClientFactory = {
  provide: AsmClient,
  useFactory: (client: ClientGrpc) => {
    return client.getService<AsmServiceClient>(ASM_SERVICE_NAME);
  },
  inject: [ASM_SERVICE_NAME],
};

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: AGENT_ASSIGNMENT_SERVICE_NAME,
        ...assignmentClientOptions,
      },
      {
        name: ASM_SERVICE_NAME,
        ...asmClientOptions,
      },
    ]),
  ],
  providers: [assignmentClientFactory, asmClientFactory],
  exports: [AssignmentClient, AsmClient],
})
export class GrpcModule {}
