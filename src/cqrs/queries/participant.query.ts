import { IQuery } from '@nestjs/cqrs'
export class AllParticipantQuery implements IQuery {
    constructor(public agentId: string) { }
}
