import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isNil } from 'lodash';

@Injectable()
export class CommonConfigService {
  constructor(private configService: ConfigService) {}

  private get(key: string, default_value: string): string {
    const value = this.configService.get<string>(key);

    if (isNil(value)) {
      return default_value;
      // throw new Error(`${key} environment variable does not set`);
    }

    return value;
  }

  getNumber(key: string, default_value = 0): number {
    try {
      const value = this.get(key, default_value.toString());

      return Number(value);
    } catch (error) {
      throw new Error(`${key} eviroment variable is not a number`);
    }
  }

  getBoolean(key: string, default_value = false): boolean {
    try {
      const value = this.get(key, default_value.toString());

      return Boolean(JSON.parse(value));
    } catch (error) {
      throw new Error(`${key} env var is not a boolean`);
    }
  }

  getString(key: string, default_value = ''): string {
    const value = this.get(key, default_value);

    return value.replace(/\\n/g, '\n');
  }
}
