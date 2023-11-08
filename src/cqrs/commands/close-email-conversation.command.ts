import { ICommand } from "@nestjs/cqrs";
import { CloseEmailDto } from "../../facade-rest-api/dtos/close-email.dto";

export class CloseEmailConversationCommand implements ICommand {
  constructor(public body: CloseEmailDto) {}
}
