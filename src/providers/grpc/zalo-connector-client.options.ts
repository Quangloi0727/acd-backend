import { ClientOptions, Transport } from '@nestjs/microservices'
import { join } from 'path'
import { protobufPackage } from '../../protos/zalo-connector.pb'
export const zaloConnectorClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: process.env.ZALO_CONNECTOR_URL || 'localhost:6868',
    package: protobufPackage,
    protoPath: join('node_modules/acd-proto/proto/zalo-connector.proto'),
  },
}
