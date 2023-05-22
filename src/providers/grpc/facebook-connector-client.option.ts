import { ClientOptions, Transport } from '@nestjs/microservices'
import { join } from 'path'
import { protobufPackage } from '../../protos/facebook-connector.pb'
export const facebookConnectorClientOptions: ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: process.env.FACEBOOK_CONNECTOR_URL || 'localhost:7878',
        package: protobufPackage,
        protoPath: join('node_modules/acd-proto/proto/facebook-connector.proto')
    }
}
