export type BroadcastType = 'SMS' | 'NOTIFICATION' | 'ANNOUNCEMENT' | 'INSTRUCTION';

export type TargetAudienceType = 'ALL' | 'INTERNS' | 'INSTRUCTORS' | 'DEPARTMENT' | 'CUSTOM';

export type RecipientStatus = 'DELIVERED' | 'READ' | 'ACKNOWLEDGED' | 'FAILED';

export interface RecipientResponse {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientRole: 'INTERN' | 'INSTRUCTOR' | 'ADMIN';
  recipientDepartment: string;
  phone?: string;
  email?: string;
  channel: 'SMS' | 'NOTIFICATION' | 'BOTH';
  deliveredAt: string;
  readAt?: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  responseText?: string;
  status: RecipientStatus;
}

export interface BroadcastRecord {
  id: string;
  title: string;
  message: string;
  type: BroadcastType;
  channel: 'SMS' | 'NOTIFICATION' | 'BOTH';
  targetAudience: TargetAudienceType;
  targetDepartment?: string;
  customRecipientIds?: string[];
  senderName: string;
  senderRole: string;
  createdAt: string;
  requireAcknowledgment: boolean;
  acknowledgmentDeadline?: string;
  urgent: boolean;
  totalRecipients: number;
  deliveredCount: number;
  acknowledgedCount: number;
  responses: RecipientResponse[];
}

export interface ChatAttachment {
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: 'ADMIN' | 'INSTRUCTOR' | 'INTERN';
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isOfficial?: boolean;
  isInstruction?: boolean;
  attachments?: ChatAttachment[];
  readBy: string[];
}

export interface ChatParticipant {
  id: string;
  name: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'INTERN';
  department?: string;
  isOnline?: boolean;
  avatarText?: string;
}

export interface ChatThread {
  id: string;
  title: string;
  type: 'CHANNEL' | 'DIRECT' | 'GROUP';
  description?: string;
  department?: string;
  isOfficial: boolean;
  unreadCount: number;
  participants: ChatParticipant[];
  lastMessage?: {
    content: string;
    timestamp: string;
    senderName: string;
  };
}
