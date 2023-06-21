import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChatSessionRegistryService } from '../../../chat-session-registry';
import { ChatSessionManagerService } from '../../../chat-session-manager/chat-session-manager.service';

import { Inject } from '@nestjs/common';
import { KafkaClientService, KafkaService } from '../../../providers/kafka';
import { SendEmailCommand } from '../send-email.command';

@CommandHandler(SendEmailCommand)
export class SendEmailCommandHandler
  implements ICommandHandler<SendEmailCommand, any>
{
  constructor(
    @Inject(KafkaClientService)
    private kafkaService: KafkaService,
    private readonly chatSessionRegistryService: ChatSessionRegistryService,
    private readonly chatSessionManagerService: ChatSessionManagerService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: SendEmailCommand): Promise<any> {
    // send request to email connector
    // notify to agent
    return true;
  }
}
