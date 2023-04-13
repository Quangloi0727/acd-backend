import { Deserializer } from '@nestjs/microservices';
import { KafkaResponse } from '../interfaces';

export class KafkaResponseDeserializer
  implements Deserializer<any, KafkaResponse>
{
  deserialize(message: any, options?: Record<string, any>): KafkaResponse {
    const { key, value, timestamp, offset, headers } = message;
    let id = key;
    let response = value;

    if (Buffer.isBuffer(key)) {
      id = Buffer.from(key).toString();
    }

    if (Buffer.isBuffer(value)) {
      const msg = Buffer.from(value).toString();
      //remove special character
      const indexOfSquareBracket = msg.indexOf('[');
      const indexOfAngleBracket = msg.indexOf('{');
      response = msg.substring(
        indexOfSquareBracket >= 0 && indexOfSquareBracket < indexOfAngleBracket
          ? indexOfSquareBracket
          : indexOfAngleBracket,
      );
    }
    Object.keys(headers).forEach((key) => {
      if (Buffer.isBuffer(headers[key])) {
        headers[key] = Buffer.from(headers[key]).toString();
      }
    });

    return {
      key: id,
      response: JSON.parse(response),
      timestamp,
      offset,
      headers,
    };
  }
}
