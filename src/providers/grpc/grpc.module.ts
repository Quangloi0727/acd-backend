import { Global, Module } from '@nestjs/common'
import { ClientGrpc, ClientsModule } from '@nestjs/microservices'
import {
  REQUEST_GET_AGENT_ASSIGNMENT_CONTROLLER_SERVICE_NAME,
  RequestGetAgentAssignmentControllerClient,
} from '../../protos/assignment.pb'
import { ASM_SERVICE_NAME, AsmServiceClient } from '../../protos/asm.pb'
import { assignmentClientOptions } from './assignment-client.options'
import { asmClientOptions } from './asm-client.options'
import { ZaloConnectorServiceClient, ZALO_CONNECTOR_SERVICE_NAME } from '../../protos/zalo-connector.pb'
import { zaloConnectorClientOptions } from './zalo-connector-client.options'

export const AssignmentClient = Symbol('ASSIGNMENT')
export const AsmClient = Symbol('ASM')
export const ZaloConnectorClient = Symbol('ZALOCONNECTOR')

const assignmentClientFactory = {
  provide: AssignmentClient,
  useFactory: (client: ClientGrpc) => {
    return client.getService<RequestGetAgentAssignmentControllerClient>(
      REQUEST_GET_AGENT_ASSIGNMENT_CONTROLLER_SERVICE_NAME,
    )
  },
  inject: [REQUEST_GET_AGENT_ASSIGNMENT_CONTROLLER_SERVICE_NAME],
}

const asmClientFactory = {
  provide: AsmClient,
  useFactory: (client: ClientGrpc) => {
    return client.getService<AsmServiceClient>(ASM_SERVICE_NAME)
  },
  inject: [ASM_SERVICE_NAME],
}

const zaloConnectorClientFactory = {
  provide: ZaloConnectorClient,
  useFactory: (client: ClientGrpc) => {
    return client.getService<ZaloConnectorServiceClient>(ZALO_CONNECTOR_SERVICE_NAME)
  },
  inject: [ZALO_CONNECTOR_SERVICE_NAME],
}

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: REQUEST_GET_AGENT_ASSIGNMENT_CONTROLLER_SERVICE_NAME,
        ...assignmentClientOptions,
      },
      {
        name: ASM_SERVICE_NAME,
        ...asmClientOptions,
      },
      {
        name: ZALO_CONNECTOR_SERVICE_NAME,
        ...zaloConnectorClientOptions,
      }
    ]),
  ],
  providers: [assignmentClientFactory, asmClientFactory, zaloConnectorClientFactory],
  exports: [AssignmentClient, AsmClient, ZaloConnectorClient],
})
export class GrpcModule { }
