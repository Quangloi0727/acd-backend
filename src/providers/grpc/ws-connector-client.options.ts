import { ClientOptions, Transport } from '@nestjs/microservices'
import { join } from 'path'
import { protobufPackage } from '../../protos/ws-connector.pb'
export const wsConnectorClientOptions: ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: process.env.WS_CONNECTOR_URL || 'localhost:7995',
        package: protobufPackage,
        protoPath: join('node_modules/acd-proto/proto/ws-connector.proto')
    }
}
