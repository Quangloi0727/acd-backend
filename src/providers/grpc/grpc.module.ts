import { Global, Module } from '@nestjs/common'
import { ClientGrpc, ClientsModule } from '@nestjs/microservices'
import {
  AGENT_ASSIGNMENT_SERVICE_NAME,
  AgentAssignmentServiceClient,
} from '../../protos/assignment.pb'
import { ASM_SERVICE_NAME, AsmServiceClient } from '../../protos/asm.pb'
import { assignmentClientOptions } from './assignment-client.options'
import { asmClientOptions } from './asm-client.options'
import { ZaloConnectorServiceClient, ZALO_CONNECTOR_SERVICE_NAME } from '../../protos/zalo-connector.pb'
import { zaloConnectorClientOptions } from './zalo-connector-client.options'
import { FacebookConnectorServiceClient, FACEBOOK_CONNECTOR_SERVICE_NAME } from '../../protos/facebook-connector.pb'
import { facebookConnectorClientOptions } from './facebook-connector-client.option'

export const AssignmentClient = Symbol('ASSIGNMENT')
export const AsmClient = Symbol('ASM')
export const ZaloConnectorClient = Symbol('ZALOCONNECTOR')
export const FacebookConnectorClient = Symbol('FACEBOOKCONNECTOR')

const assignmentClientFactory = {
  provide: AssignmentClient,
  useFactory: (client: ClientGrpc) => {
    return client.getService<AgentAssignmentServiceClient>(
      AGENT_ASSIGNMENT_SERVICE_NAME,
    )
  },
  inject: [AGENT_ASSIGNMENT_SERVICE_NAME],
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

const facebookConnectorClientFactory = {
  provide: FacebookConnectorClient,
  useFactory: (client: ClientGrpc) => {
    return client.getService<FacebookConnectorServiceClient>(FACEBOOK_CONNECTOR_SERVICE_NAME)
  },
  inject: [FACEBOOK_CONNECTOR_SERVICE_NAME],
}

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
      {
        name: ZALO_CONNECTOR_SERVICE_NAME,
        ...zaloConnectorClientOptions,
      },
      {
        name: FACEBOOK_CONNECTOR_SERVICE_NAME,
        ...facebookConnectorClientOptions,
      }
    ]),
  ],
  providers: [assignmentClientFactory, asmClientFactory, zaloConnectorClientFactory, facebookConnectorClientFactory],
  exports: [AssignmentClient, AsmClient, ZaloConnectorClient, FacebookConnectorClient],
})

export class GrpcModule { }
