export const enum KAFKA_TOPIC {
  CONNECTOR_MESSAGE_RECEIVED = 'ACD.Message.Received',
  NOTIFY_NEW_MESSAGE = 'test',
  NEW_EMAIL_RECEIVED = 'test',
}

export const enum KAFKA_TOPIC_MONITOR {
  CONVERSATION_NEW = 'ACD.Conversation.New',
  CONVERSATION_MESSAGE_RECEIVE = 'ACD.Conversation.Message.Receive',
  CONVERSATION_MESSAGE_SEND = 'ACD.Conversation.Message.Send',
  CONVERSATION_ASSIGN = 'ACD.Conversation.Assign',
  CONVERSATION_PICK = 'ACD.Conversation.Pick',
  CONVERSATION_CLOSE = 'ACD.Conversation.Close',
  CONVERSATION_REOPEN = 'ACD.Conversation.Reopen',
  CONVERSATION_GENERAL_REPORT = 'ACD.Conversation.General.Report',
}
