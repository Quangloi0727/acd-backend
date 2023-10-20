import {Injectable} from '@nestjs/common';
import {CommonConfigService} from '../config.service';

@Injectable()
export class KafkaConfigService {
	constructor(private commonConfigService: CommonConfigService) {
	}

	get brokers(): string[] {
		const brokers = this.commonConfigService.getString('KAFKA_BROKER', 'broker:9092');
		if (brokers && brokers.indexOf(',') > 0) {
			return brokers.split(',').map(broker => broker.trim());
		}

		return [brokers];
	}

	get registry_host(): string {
		return this.commonConfigService.getString(
			'KAFKA_REGISTRY',
			'http://registry:8081',
		);
	}

	get client_id(): string {
		return this.commonConfigService.getString('KAFKA_CLIENT_ID', 'acd-backend');
	}

	get group_id(): string {
		return this.commonConfigService.getString('KAFKA_GROUP_ID', 'acd-backend');
	}

	get connection_timeout(): number {
		return this.commonConfigService.getNumber('KAFKA_CONNECTION_TIMEOUT', 3000);
	}

	get authentication_timeout(): number {
		return this.commonConfigService.getNumber(
			'KAFKA_AUTHENTICATION_TIMEOUT',
			1000,
		);
	}

	get reauthentication_timeout(): number {
		return this.commonConfigService.getNumber(
			'KAFKA_REAUTHENTICATION_THRESHOLD',
			10000,
		);
	}

	get transaction_timeout(): number {
		return this.commonConfigService.getNumber(
			'KAFKA_TRANSACTION_TIMEOUT',
			30000,
		);
	}

	get response_timeout(): number {
		return this.commonConfigService.getNumber('KAFKA_RESPONSE_TIMEOUT', 30000);
	}

	get sasl_enable(): boolean {
		return this.commonConfigService.getBoolean('KAFKA_SASL_ENABLED', false);
	}

	get username(): string {
		return this.commonConfigService.getString('KAFKA_SASL_USERNAME');
	}

	get password(): string {
		return this.commonConfigService.getString('KAFKA_SASL_PASSWORD');
	}

	get mechanism(): string {
		return this.commonConfigService.getString('KAFKA_SASL_MECHANISM');
	}
}
