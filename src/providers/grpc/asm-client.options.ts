import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { protobufPackage } from '../../protos/asm.pb';
export const asmClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: process.env.ASM_URL || 'localhost:50053',
    package: protobufPackage,
    protoPath: join('node_modules/acd-proto/proto/asm.proto'),
  },
};
