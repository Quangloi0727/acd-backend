import { IQuery } from '@nestjs/cqrs';
export class TenantByApplicationQuery implements IQuery {
  constructor(public applicationId: string) {}
}
