import { Logger } from '@nestjs/common';
import {
  isNil,
  isPlainObject,
  isString,
  isUndefined,
} from '@nestjs/common/utils/shared.utils';
import { Serializer } from '@nestjs/microservices/interfaces/serializer.interface';

export interface KafkaRequest<T = any> {
  key: Buffer | string | null;
  value: T;
  topic: string;
  headers: Record<string, any>;
}

export class KafkaRequestSerializer implements Serializer<any, KafkaRequest> {
  protected logger = new Logger(KafkaRequestSerializer.name);
  serialize(value: any): KafkaRequest {
    const outgoingMessage = value;
    try {
      const messages = value.messages.map((origMessage) => {
        const encodedValue =
          '\u0000\u0000\u0000\u0000\u000f' + JSON.stringify(origMessage.value);
        return {
          ...origMessage,
          value: encodedValue,
        };
      });

      outgoingMessage.messages = messages;
    } catch (e) {
      this.logger.error('Error serializing', e);
      throw e;
    }

    return outgoingMessage;
  }

  public encode(value: any): Buffer | string | null {
    const isObjectOrArray =
      !isNil(value) && !isString(value) && !Buffer.isBuffer(value);

    if (isObjectOrArray) {
      return isPlainObject(value) || Array.isArray(value)
        ? JSON.stringify(value)
        : value.toString();
    } else if (isUndefined(value)) {
      return null;
    }
    return value;
  }
}
