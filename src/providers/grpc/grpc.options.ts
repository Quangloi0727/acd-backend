import { GrpcOptions, Transport } from '@nestjs/microservices';
import { protobufPackage } from '../../protos/backend.pb';
import { join } from 'path';

export const gprcOptions: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    url: process.env.GRPC_URL || '0.0.0.0:50051',
    package: protobufPackage,
    protoPath: join('node_modules/acd-proto/proto/backend.proto'),
  },
};
