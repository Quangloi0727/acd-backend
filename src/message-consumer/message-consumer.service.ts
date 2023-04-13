import { Injectable } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from '../schemas/message.schema';
import { Model } from 'mongoose';

@Injectable()
export class MessageConsumerService {
  constructor(
    @InjectModel(Message.name)
    private readonly model: Model<MessageDocument>,
  ) {}

  async saveMessage(data: MessageDto): Promise<MessageDocument> {
    return await new this.model({ ...data }).save();
  }
}
