import { Global, Module } from '@nestjs/common';
import { ClientGrpc, ClientsModule } from '@nestjs/microservices';
import {
  AGENT_ASSIGNMENT_SERVICE_NAME,
  AgentAssignmentServiceClient,
} from '../../protos/assignment.pb';
import { ASM_SERVICE_NAME, AsmServiceClient } from '../../protos/asm.pb';
import { assignmentClientOptions } from './assignment-client.options';
import { asmClientOptions } from './asm-client.options';
import {
  ZaloConnectorServiceClient,
  ZALO_CONNECTOR_SERVICE_NAME,
} from '../../protos/zalo-connector.pb';
import { zaloConnectorClientOptions } from './zalo-connector-client.options';
import {
  FacebookConnectorServiceClient,
  FACEBOOK_CONNECTOR_SERVICE_NAME,
} from '../../protos/facebook-connector.pb';
import { facebookConnectorClientOptions } from './facebook-connector-client.option';
import {
  EmailServiceClient,
  EMAIL_SERVICE_NAME,
} from '../../protos/email-connector.pb';
import { emailClientOptions } from './email-connector-client.option';
import { WHAT_SAPP_CONNECTOR_SERVICE_NAME, WhatSappConnectorServiceClient } from 'src/protos/ws-connector.pb'
import { wsConnectorClientOptions } from './ws-connector-client.options'
import { VIBER_CONNECTOR_SERVICE_NAME, ViberConnectorServiceClient } from 'src/protos/viber-connector.pb'
import { viberConnectorClientOptions } from './viber-connector-client.option'
import { TELEGRAM_CONNECTOR_SERVICE_NAME, TelegramConnectorServiceClient } from 'src/protos/telegram-connector.pb'
import { telegramConnectorClientOptions } from './telegram-connector-client.option'

export const AssignmentClient = Symbol('ASSIGNMENT');
export const AsmClient = Symbol('ASM');
export const ZaloConnectorClient = Symbol('ZALOCONNECTOR');
export const FacebookConnectorClient = Symbol('FACEBOOKCONNECTOR');
export const EmailConnectorClient = Symbol('EMAIL_CONNECTOR');
export const WSConnectorClient = Symbol('WS_CONNECTOR');
export const ViberConnectorClient = Symbol('VIBER_CONNECTOR');
export const TelegramConnectorClient = Symbol('TELEGRAM_CONNECTOR');

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

const zaloConnectorClientFactory = {
  provide: ZaloConnectorClient,
  useFactory: (client: ClientGrpc) => {
    return client.getService<ZaloConnectorServiceClient>(
      ZALO_CONNECTOR_SERVICE_NAME,
    );
  },
  inject: [ZALO_CONNECTOR_SERVICE_NAME],
};

const facebookConnectorClientFactory = {
  provide: FacebookConnectorClient,
  useFactory: (client: ClientGrpc) => {
    return client.getService<FacebookConnectorServiceClient>(
      FACEBOOK_CONNECTOR_SERVICE_NAME,
    );
  },
  inject: [FACEBOOK_CONNECTOR_SERVICE_NAME],
};

const emailConnectorClientFactory = {
  provide: EmailConnectorClient,
  useFactory: (client: ClientGrpc) => {
    return client.getService<EmailServiceClient>(EMAIL_SERVICE_NAME);
  },
  inject: [EMAIL_SERVICE_NAME],
};

const wsConnectorClientFactory = {
  provide: WSConnectorClient,
  useFactory: (client: ClientGrpc) => {
    return client.getService<WhatSappConnectorServiceClient>(WHAT_SAPP_CONNECTOR_SERVICE_NAME);
  },
  inject: [WHAT_SAPP_CONNECTOR_SERVICE_NAME],
};

const viberConnectorClientFactory = {
  provide: ViberConnectorClient,
  useFactory: (client: ClientGrpc) => {
    return client.getService<ViberConnectorServiceClient>(VIBER_CONNECTOR_SERVICE_NAME);
  },
  inject: [VIBER_CONNECTOR_SERVICE_NAME],
};

const telegramConnectorClientFactory = {
  provide: TelegramConnectorClient,
  useFactory: (client: ClientGrpc) => {
    return client.getService<TelegramConnectorServiceClient>(TELEGRAM_CONNECTOR_SERVICE_NAME);
  },
  inject: [TELEGRAM_CONNECTOR_SERVICE_NAME],
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
      {
        name: ZALO_CONNECTOR_SERVICE_NAME,
        ...zaloConnectorClientOptions,
      },
      {
        name: FACEBOOK_CONNECTOR_SERVICE_NAME,
        ...facebookConnectorClientOptions,
      },
      {
        name: EMAIL_SERVICE_NAME,
        ...emailClientOptions,
      },
      {
        name: WHAT_SAPP_CONNECTOR_SERVICE_NAME,
        ...wsConnectorClientOptions,
      },
      {
        name: VIBER_CONNECTOR_SERVICE_NAME,
        ...viberConnectorClientOptions,
      },
      {
        name: TELEGRAM_CONNECTOR_SERVICE_NAME,
        ...telegramConnectorClientOptions,
      },
    ]),
  ],
  providers: [
    assignmentClientFactory,
    asmClientFactory,
    zaloConnectorClientFactory,
    facebookConnectorClientFactory,
    emailConnectorClientFactory,
    wsConnectorClientFactory,
    viberConnectorClientFactory,
    telegramConnectorClientFactory
  ],
  exports: [
    AssignmentClient,
    AsmClient,
    ZaloConnectorClient,
    FacebookConnectorClient,
    EmailConnectorClient,
    WSConnectorClient,
    ViberConnectorClient,
    TelegramConnectorClient
  ],
})
export class GrpcModule {}
