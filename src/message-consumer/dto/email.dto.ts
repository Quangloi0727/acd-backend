export interface Attachment {
  id: string;
  name: string;
  size: number;
  ctime: number;
  relPath: string;
  absPath: string;
  inline: boolean;
}

export interface EmailDto {
  id: number;
  from: string;
  to: string;
  cc?: string;
  bcc?: string;
  ctime?: number;
  subject?: string;
  html?: string;
  attachments?: Attachment[];
}
