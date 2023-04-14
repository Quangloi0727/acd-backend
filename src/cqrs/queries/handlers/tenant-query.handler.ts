import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TenantByApplicationQuery } from '../tenant.query';
import { Tenant, TenantDocument } from '../../../schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@QueryHandler(TenantByApplicationQuery)
export class TenantByApplicationQueryHandler
  implements IQueryHandler<TenantByApplicationQuery, TenantDocument>
{
  constructor(
    @InjectModel(Tenant.name)
    private readonly model: Model<TenantDocument>,
  ) {}

  async execute(query: TenantByApplicationQuery): Promise<TenantDocument> {
    return await this.model
      .findOne({
        applicationIds: query.applicationId,
      })
      .exec();
  }
}
