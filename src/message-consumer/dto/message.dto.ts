export class MessageDto {
  messageId: string;
  text: string;
  timestamp: number;
  senderId: string;
  applicationId: string;
  channel: Channel;
  event: string;
  media: Media[];
}

export enum Channel {
  ZL_MESSAGE = 'ZL_MESSAGE',
  FB_MESSAGE = 'FB_MESSAGE',
  FB_PAGE = 'FB_PAGE',
  ZL_PAGE = 'ZL_PAGE',
  LIVE_CHAT = 'LIVE_CHAT',
}

export class Media {
  media: string;
  fileName: string;
  size: number;
  fileType: string;
  mediaType: string;
}
