import { ChannelType } from '../../common/enums';

export class MessageDto {
  messageId: string;
  text: string;
  timestamp: number;
  senderId: string;
  applicationId: string;
  channel: ChannelType;
  event: string;
  media: Media[];
}

export class Media {
  media: string;
  fileName: string;
  size: number;
  fileType: string;
  mediaType: string;
}
