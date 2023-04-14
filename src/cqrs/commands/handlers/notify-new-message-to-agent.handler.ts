import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpService } from '@nestjs/axios';
import { NotifyNewMessageToAgentCommand } from '../notify-new-message-to-agent.command';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { LoggingService } from '../../../providers/logging';
import { NotificationServerApiBaseResponse } from '../../../common/base/notify-server-base-response';

@CommandHandler(NotifyNewMessageToAgentCommand)
export class NotifyNewMessageToAgentCommandHandler
  implements
    ICommandHandler<
      NotifyNewMessageToAgentCommand,
      NotificationServerApiBaseResponse
    >
{
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggingService,
  ) {}
  async execute(
    command: NotifyNewMessageToAgentCommand,
  ): Promise<NotificationServerApiBaseResponse> {
    const base_url = process.env.NOTIFICATION_SERVER_URL || 'localhost:3000';
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .post<NotificationServerApiBaseResponse>(
            `${base_url}/notification/new`,
            command,
          )
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                NotifyNewMessageToAgentCommandHandler,
                error.message,
              );
              throw new Error(error.message);
            }),
          ),
      );
      return data;
    } catch (e) {
      return new NotificationServerApiBaseResponse(false);
    }
  }
}
