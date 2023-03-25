import { Injectable } from '@nestjs/common';
import { existsSync, readdirSync } from 'fs';
import * as path from 'path';

import { CommonConfigService } from '../config.service';

@Injectable()
export class DatabaseConfigService {
  constructor(private commonConfigService: CommonConfigService) {}

  get type(): string {
    return this.commonConfigService.getString('DB_TYPE');
  }

  get host(): string {
    return this.commonConfigService.getString('DB_HOST');
  }

  get port(): number {
    return this.commonConfigService.getNumber('DB_PORT');
  }

  get username(): string {
    return this.commonConfigService.getString('DB_USERNAME');
  }

  get password(): string {
    return this.commonConfigService.getString('DB_PASSWORD');
  }

  get database(): string {
    return this.commonConfigService.getString('DB_DATABASE');
  }

  get url(): string {
    return this.commonConfigService.getString(
      'DB_URI',
      `${this.type}://${this.username}:${encodeURIComponent(this.password)}@${
        this.host
      }:${this.port}/${this.database}`,
    );
  }

  get entities(): string[] {
    const entitiesPath = path.join(process.cwd(), 'src', 'entities');

    const entities = [entitiesPath + '/*.entity.{ts,js}'];

    console.log('entities: ', entities);

    return entities;
  }

  async migrations() {
    let migrations = [];
    const migrationsDir = path.join(
      __dirname,
      '../../',
      'providers',
      'database',
      'migrations',
    );

    if (!existsSync(migrationsDir)) return migrations;

    const migrationFiles = readdirSync(migrationsDir).filter(
      (f) => f.endsWith('.js') && !f.endsWith('d.js'),
    );

    for (const file of migrationFiles) {
      const migrationClass = await import(`${migrationsDir}/${file}`);
      migrations = [...migrations, ...Object.values(migrationClass)];
    }

    return migrations;
  }
}
