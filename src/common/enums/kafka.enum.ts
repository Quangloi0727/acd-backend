export class KAFKA_TOPIC {
  static CONNECTOR_MESSAGE_RECEIVED =
    process.env.TOPIC_NEW_MESSAGE_RECEIVED || 'ACD.Message.Received';
  static NOTIFY_NEW_MESSAGE = 'test';
  static NEW_EMAIL_RECEIVED =
    process.env.TOPIC_NEW_EMAIL_RECEIVED || 'ACD.Email.NewEmail';
}

export const enum KAFKA_TOPIC_MONITOR {
  CONVERSATION_NEW = 'ACD.Conversation.New',
  CONVERSATION_MESSAGE_RECEIVE = 'ACD.Conversation.Message.Receive',
  CONVERSATION_MESSAGE_SEND = 'ACD.Conversation.Message.Send',
  CONVERSATION_ASSIGN = 'ACD.Conversation.Assign',
  CONVERSATION_PICK = 'ACD.Conversation.Pick',
  CONVERSATION_JOIN = 'ACD.Conversation.Join',
  CONVERSATION_LEAVE = 'ACD.Conversation.Leave',
  CONVERSATION_UNASSIGN = 'ACD.Conversation.Unassign',
  CONVERSATION_UNASSIGN_BY_SYSTEM = 'ACD.Conversation.Unassign.By.System',
  CONVERSATION_ASSIGN_BY_SYSTEM = 'ACD.Conversation.Assign.By.System',
  CONVERSATION_CLOSE = 'ACD.Conversation.Close',
  CONVERSATION_REOPEN = 'ACD.Conversation.Reopen',
  CONVERSATION_MESSAGE_TRANSFER = 'ACD.Conversation.Message.Transfer',
  CONVERSATION_GENERAL_REPORT = 'ACD.Conversation.General.Report',
  EMAIL_RECEIVED = 'ACD.Email.Received',
  EMAIL_ASSIGNED = 'ACD.Email.Assigned',
  EMAIL_SENT = 'ACD.Email.Sent',
  EMAIL_READ = 'ACD.Email.Read',
  EMAIL_UNREAD = 'ACD.Email.Unread',
  EMAIL_SPAM_MARKED = 'ACD.Email.SpamMarked',
  EMAIL_SPAM_UNMARKED = 'ACD.Email.SpamUnmarked',
}
