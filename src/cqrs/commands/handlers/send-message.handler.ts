import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendMessageCommand } from '../send-message.command';

@CommandHandler(SendMessageCommand)
export class SendMessageCommandHandler
  implements ICommandHandler<SendMessageCommand, boolean>
{
  async execute(command: SendMessageCommand): Promise<boolean> {
    console.log(command);
    return true;
  }
}
