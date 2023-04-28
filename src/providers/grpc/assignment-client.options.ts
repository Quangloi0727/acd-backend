import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { protobufPackage } from '../../protos/assignment.pb';
export const assignmentClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: process.env.ASSIGNMENT_URL || 'localhost:6972',
    package: protobufPackage,
    protoPath: join('node_modules/acd-proto/proto/assignment.proto'),
  },
};
