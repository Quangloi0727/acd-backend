import { ClientOptions, Transport } from '@nestjs/microservices'
import { join } from 'path'
import { protobufPackage } from '../../protos/telegram-connector.pb'
export const telegramConnectorClientOptions: ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: process.env.TELEGRAM_CONNECTOR_URL || 'localhost:7993',
        package: protobufPackage,
        protoPath: join('node_modules/acd-proto/proto/telegram-connector.proto')
    }
}