import { ClientOptions, Transport } from '@nestjs/microservices'
import { join } from 'path'
import { protobufPackage } from '../../protos/viber-connector.pb'
export const viberConnectorClientOptions: ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: process.env.VIBER_CONNECTOR_URL || 'localhost:7997',
        package: protobufPackage,
        protoPath: join('node_modules/acd-proto/proto/viber-connector.proto')
    }
}