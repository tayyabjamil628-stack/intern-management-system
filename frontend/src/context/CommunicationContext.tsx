import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BroadcastRecord,
  ChatThread,
  ChatMessage,
  RecipientResponse,
  BroadcastType,
  TargetAudienceType,
} from '../types/communication';
import {
  mockBroadcastList,
  mockChatThreads,
  mockChatMessages,
} from '../data/mockCommunicationData';
import { mockInternsList } from '../data/mockInternsData';
import { mockInstructorsList } from '../data/mockInstructorsData';

interface SendBroadcastInput {
  title: string;
  message: string;
  type: BroadcastType;
  channel: 'SMS' | 'NOTIFICATION' | 'BOTH';
  targetAudience: TargetAudienceType;
  targetDepartment?: string;
  customRecipientIds?: string[];
  senderName: string;
  senderRole: string;
  requireAcknowledgment: boolean;
  acknowledgmentDeadline?: string;
  urgent: boolean;
}

interface CommunicationContextType {
  broadcasts: BroadcastRecord[];
  chatThreads: ChatThread[];
  messages: Record<string, ChatMessage[]>;
  activeThreadId: string;
  setActiveThreadId: (id: string) => void;
  sendBroadcast: (input: SendBroadcastInput) => BroadcastRecord;
  sendChatMessage: (
    threadId: string,
    content: string,
    sender: { id: string; name: string; role: 'ADMIN' | 'INSTRUCTOR' | 'INTERN' },
    options?: { isOfficial?: boolean; isInstruction?: boolean; attachments?: any[] }
  ) => void;
  acknowledgeBroadcast: (
    broadcastId: string,
    recipientId: string,
    responseText?: string
  ) => void;
  markThreadRead: (threadId: string) => void;
  resendReminder: (broadcastId: string, recipientId?: string) => void;
  totalUnreadMessages: number;
  totalPendingAcknowledgments: number;
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

export const CommunicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>(() => {
    const saved = localStorage.getItem('ims_broadcasts');
    return saved ? JSON.parse(saved) : mockBroadcastList;
  });

  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => {
    const saved = localStorage.getItem('ims_chat_threads');
    return saved ? JSON.parse(saved) : mockChatThreads;
  });

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('ims_chat_messages');
    return saved ? JSON.parse(saved) : mockChatMessages;
  });

  const [activeThreadId, setActiveThreadId] = useState<string>('thread-general');

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('ims_broadcasts', JSON.stringify(broadcasts));
  }, [broadcasts]);

  useEffect(() => {
    localStorage.setItem('ims_chat_threads', JSON.stringify(chatThreads));
  }, [chatThreads]);

  useEffect(() => {
    localStorage.setItem('ims_chat_messages', JSON.stringify(messages));
  }, [messages]);

  // Compute total unread messages
  const totalUnreadMessages = chatThreads.reduce((acc, t) => acc + t.unreadCount, 0);

  // Compute total pending acknowledgments
  const totalPendingAcknowledgments = broadcasts.reduce((acc, b) => {
    if (!b.requireAcknowledgment) return acc;
    const pending = b.responses.filter((r) => !r.acknowledged).length;
    return acc + pending;
  }, 0);

  // Helper to generate recipient list based on audience targeting
  const generateRecipients = (
    audience: TargetAudienceType,
    department?: string,
    customIds?: string[],
    channel: 'SMS' | 'NOTIFICATION' | 'BOTH' = 'BOTH'
  ): RecipientResponse[] => {
    const responses: RecipientResponse[] = [];
    const now = new Date().toISOString();

    // Intern recipients
    if (audience === 'ALL' || audience === 'INTERNS' || audience === 'DEPARTMENT' || audience === 'CUSTOM') {
      mockInternsList.forEach((intern) => {
        let match = false;
        if (audience === 'ALL' || audience === 'INTERNS') match = true;
        if (audience === 'DEPARTMENT' && intern.department.toLowerCase() === department?.toLowerCase()) match = true;
        if (audience === 'CUSTOM' && customIds?.includes(intern.internId)) match = true;

        if (match) {
          responses.push({
            id: `resp-${Date.now()}-${intern.internId}`,
            recipientId: intern.internId,
            recipientName: intern.fullName,
            recipientRole: 'INTERN',
            recipientDepartment: intern.department,
            phone: intern.phone || '+1 (555) 000-0000',
            email: intern.email,
            channel,
            deliveredAt: now,
            acknowledged: false,
            status: 'DELIVERED',
          });
        }
      });
    }

    // Instructor recipients
    if (audience === 'ALL' || audience === 'INSTRUCTORS' || audience === 'DEPARTMENT' || audience === 'CUSTOM') {
      mockInstructorsList.forEach((instructor) => {
        let match = false;
        if (audience === 'ALL' || audience === 'INSTRUCTORS') match = true;
        if (audience === 'DEPARTMENT' && instructor.department.toLowerCase() === department?.toLowerCase()) match = true;
        if (audience === 'CUSTOM' && customIds?.includes(instructor.instructorId)) match = true;

        if (match) {
          responses.push({
            id: `resp-${Date.now()}-${instructor.instructorId}`,
            recipientId: instructor.instructorId,
            recipientName: instructor.fullName,
            recipientRole: 'INSTRUCTOR',
            recipientDepartment: instructor.department,
            phone: instructor.phone || '+1 (555) 000-0000',
            email: instructor.email,
            channel,
            deliveredAt: now,
            acknowledged: false,
            status: 'DELIVERED',
          });
        }
      });
    }

    return responses;
  };

  const sendBroadcast = (input: SendBroadcastInput): BroadcastRecord => {
    const responses = generateRecipients(
      input.targetAudience,
      input.targetDepartment,
      input.customRecipientIds,
      input.channel
    );

    const newBroadcast: BroadcastRecord = {
      id: `bc-${Date.now()}`,
      title: input.title,
      message: input.message,
      type: input.type,
      channel: input.channel,
      targetAudience: input.targetAudience,
      targetDepartment: input.targetDepartment,
      customRecipientIds: input.customRecipientIds,
      senderName: input.senderName || 'Admin Operations',
      senderRole: input.senderRole || 'System Administrator',
      createdAt: new Date().toISOString(),
      requireAcknowledgment: input.requireAcknowledgment,
      acknowledgmentDeadline: input.acknowledgmentDeadline,
      urgent: input.urgent,
      totalRecipients: responses.length || 1,
      deliveredCount: responses.length || 1,
      acknowledgedCount: 0,
      responses,
    };

    setBroadcasts((prev) => [newBroadcast, ...prev]);

    // Also post into #general-announcements channel
    const announcementMsg: ChatMessage = {
      id: `msg-auto-${Date.now()}`,
      threadId: 'thread-general',
      senderId: 'admin-1',
      senderName: input.senderName || 'Admin Operations',
      senderRole: 'ADMIN',
      content: `📢 [${input.type} BROADCAST] ${input.title}\n\n${input.message}`,
      timestamp: 'Just now',
      isOfficial: true,
      isInstruction: input.type === 'INSTRUCTION',
      readBy: ['admin-1'],
    };

    setMessages((prev) => ({
      ...prev,
      'thread-general': [...(prev['thread-general'] || []), announcementMsg],
    }));

    setChatThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === 'thread-general') {
          return {
            ...thread,
            lastMessage: {
              content: `${input.title}`,
              timestamp: 'Just now',
              senderName: input.senderName || 'Admin Operations',
            },
          };
        }
        return thread;
      })
    );

    return newBroadcast;
  };

  const sendChatMessage = (
    threadId: string,
    content: string,
    sender: { id: string; name: string; role: 'ADMIN' | 'INSTRUCTOR' | 'INTERN' },
    options?: { isOfficial?: boolean; isInstruction?: boolean; attachments?: any[] }
  ) => {
    if (!content.trim() && (!options?.attachments || options.attachments.length === 0)) return;

    const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      threadId,
      senderId: sender.id,
      senderName: sender.name,
      senderRole: sender.role,
      content,
      timestamp: `Today • ${timeStr}`,
      isOfficial: options?.isOfficial ?? (sender.role === 'ADMIN' || sender.role === 'INSTRUCTOR'),
      isInstruction: options?.isInstruction ?? false,
      attachments: options?.attachments,
      readBy: [sender.id],
    };

    setMessages((prev) => ({
      ...prev,
      [threadId]: [...(prev[threadId] || []), newMsg],
    }));

    setChatThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === threadId) {
          return {
            ...thread,
            lastMessage: {
              content: content || 'Sent an attachment',
              timestamp: timeStr,
              senderName: sender.name,
            },
          };
        }
        return thread;
      })
    );

    // If intern messages in DM or channel, simulate supervisor/admin auto acknowledgement after 1.5s if not admin
    if (sender.role === 'INTERN' && threadId.startsWith('thread-dm-')) {
      setTimeout(() => {
        const replyTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const autoReply: ChatMessage = {
          id: `msg-reply-${Date.now()}`,
          threadId,
          senderId: 'inst-1',
          senderName: 'Dr. Robert Vance',
          senderRole: 'INSTRUCTOR',
          content: 'Received and reviewed your update. Keep up the excellent progress!',
          timestamp: `Today • ${replyTime}`,
          isOfficial: true,
          readBy: ['inst-1'],
        };
        setMessages((prev) => ({
          ...prev,
          [threadId]: [...(prev[threadId] || []), autoReply],
        }));
        setChatThreads((prev) =>
          prev.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  lastMessage: {
                    content: autoReply.content,
                    timestamp: replyTime,
                    senderName: autoReply.senderName,
                  },
                }
              : t
          )
        );
      }, 1500);
    }
  };

  const acknowledgeBroadcast = (
    broadcastId: string,
    recipientId: string,
    responseText?: string
  ) => {
    const now = new Date().toISOString();

    setBroadcasts((prev) =>
      prev.map((b) => {
        if (b.id !== broadcastId) return b;

        let found = false;
        const updatedResponses = b.responses.map((r) => {
          if (r.recipientId === recipientId) {
            found = true;
            return {
              ...r,
              acknowledged: true,
              acknowledgedAt: now,
              readAt: r.readAt || now,
              responseText: responseText || r.responseText || 'Acknowledged via portal.',
              status: 'ACKNOWLEDGED' as const,
            };
          }
          return r;
        });

        // If recipient was not in list (e.g. self-acknowledged current intern)
        if (!found) {
          updatedResponses.push({
            id: `resp-manual-${Date.now()}`,
            recipientId,
            recipientName: 'Sarah Jenkins',
            recipientRole: 'INTERN',
            recipientDepartment: 'Software Engineering',
            channel: 'NOTIFICATION',
            deliveredAt: now,
            readAt: now,
            acknowledged: true,
            acknowledgedAt: now,
            responseText: responseText || 'Acknowledged and confirmed.',
            status: 'ACKNOWLEDGED',
          });
        }

        const acknowledgedCount = updatedResponses.filter((r) => r.acknowledged).length;

        return {
          ...b,
          acknowledgedCount,
          responses: updatedResponses,
        };
      })
    );
  };

  const markThreadRead = (threadId: string) => {
    setChatThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t))
    );
  };

  const resendReminder = (broadcastId: string, recipientId?: string) => {
    setBroadcasts((prev) =>
      prev.map((b) => {
        if (b.id !== broadcastId) return b;
        return {
          ...b,
          responses: b.responses.map((r) => {
            if (!recipientId || r.recipientId === recipientId) {
              return {
                ...r,
                deliveredAt: new Date().toISOString(),
                status: r.acknowledged ? r.status : 'DELIVERED',
              };
            }
            return r;
          }),
        };
      })
    );
  };

  return (
    <CommunicationContext.Provider
      value={{
        broadcasts,
        chatThreads,
        messages,
        activeThreadId,
        setActiveThreadId,
        sendBroadcast,
        sendChatMessage,
        acknowledgeBroadcast,
        markThreadRead,
        resendReminder,
        totalUnreadMessages,
        totalPendingAcknowledgments,
      }}
    >
      {children}
    </CommunicationContext.Provider>
  );
};

export const useCommunication = () => {
  const context = useContext(CommunicationContext);
  if (!context) {
    throw new Error('useCommunication must be used within a CommunicationProvider');
  }
  return context;
};
