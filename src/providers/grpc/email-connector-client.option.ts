import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { protobufPackage } from '../../protos/email-connector.pb';
export const emailClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: process.env.EMAIL_CONNECTOR_URL || '172.16.86.188:8000',
    package: protobufPackage,
    protoPath: join('node_modules/acd-proto/proto/email-connector.proto'),
  },
};
