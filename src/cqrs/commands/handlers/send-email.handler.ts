import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendEmailCommand } from '../send-email.command';
import { EmailSessionManagerService } from '../../../email-session-manager';
import { SendEmailDto } from '../../../facade-rest-api/dtos/send-email.dto';

@CommandHandler(SendEmailCommand)
export class SendEmailCommandHandler
  implements ICommandHandler<SendEmailCommand, any>
{
  constructor(
    private readonly emailSessionManagerService: EmailSessionManagerService,
  ) {}

  async execute(command: SendEmailCommand): Promise<any> {
    // send request to email connector
    await this.emailSessionManagerService.sendEmail(
      SendEmailDto.toSendEmailRequest(command.message),
    );
    // notify to agent
    return true;
  }
}
