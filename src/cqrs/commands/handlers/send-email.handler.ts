import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendEmailCommand } from '../send-email.command';
import { EmailSessionManagerService } from '../../../email-session-manager';
import { SendEmailDto } from '../../../facade-rest-api/dtos/send-email.dto';
import { LoggingService } from '../../../providers/logging';
import { SaveEmailCommand } from '../save-email.command';
import { Email, EmailDocument } from '../../../schemas';
import { EmailSessionRegistryService } from '../../../email-session-registry';

@CommandHandler(SendEmailCommand)
export class SendEmailCommandHandler
  implements ICommandHandler<SendEmailCommand, string>
{
  constructor(
    private readonly loggingService: LoggingService,
    private readonly emailSessionManagerService: EmailSessionManagerService,
    private readonly emailSessionRegistryService: EmailSessionRegistryService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: SendEmailCommand): Promise<string> {
    await this.loggingService.debug(
      SendEmailCommandHandler,
      `SendEmailCommandHandler request from email: ${command.message.email}, to: ${command.message.to}`,
    );

    const sendEmailRequest = SendEmailDto.toSendEmailRequest(command.message);
    const subjectConversationId =
      this.emailSessionRegistryService.getConversationIdFromSubject(
        command.message.subject,
      );

    // add conversationId to subject
    if (!subjectConversationId) {
      sendEmailRequest.message.subject = `#${command.message.conversationId.toUpperCase()} - ${
        sendEmailRequest.message.subject
      }`;
    }

    // send request to email connector
    const response = await this.emailSessionManagerService.sendEmail(
      sendEmailRequest,
    );
    // console.log(response);

    if (response) {
      await this.loggingService.debug(
        SendEmailCommandHandler,
        `SendEmailCommandHandler response: ${JSON.stringify(response)}`,
      );
      const email_request = Email.fromSendEmailRequestDto(command.message);
      // save email
      const email = await this.commandBus.execute<
        SaveEmailCommand,
        EmailDocument
      >(new SaveEmailCommand(email_request));
      // notify to agent
      return email.id;
    }
    return null;
  }
}
