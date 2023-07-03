import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { LoggingService } from '../../../providers/logging';
import { NotificationServerApiBaseResponse } from '../../../common/base/notify-server-base-response';
import { NotifyNewEmailToAgentCommand } from '../notify-new-email-to-agent.command';

@CommandHandler(NotifyNewEmailToAgentCommand)
export class NotifyNewEmailToAgentCommandHandler
  implements
    ICommandHandler<
      NotifyNewEmailToAgentCommand,
      NotificationServerApiBaseResponse
    >
{
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggingService,
  ) {}
  async execute(
    command: NotifyNewEmailToAgentCommand,
  ): Promise<NotificationServerApiBaseResponse> {
    this.logger.debug(
      NotifyNewEmailToAgentCommandHandler,
      `notify request: ${JSON.stringify(command.data)}`,
    );
    const base_url = process.env.NOTIFICATION_SERVER_URL || 'localhost:3000';
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .post<NotificationServerApiBaseResponse>(
            `${base_url}/notification/jobProcessCompleted`,
            command.data,
            {
              headers: { 'Content-Type': 'application/json' },
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                NotifyNewEmailToAgentCommandHandler,
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
