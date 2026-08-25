import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  MessageSquare,
  Hash,
  User,
  ShieldCheck,
  Paperclip,
  Smile,
  Search,
  Plus,
  CheckCheck,
  Clock,
  Sparkles,
  Building2,
  GraduationCap,
  Users,
  FileText,
  AlertCircle,
  X,
} from 'lucide-react';
import { useCommunication } from '../../context/CommunicationContext';
import { ChatParticipant, ChatMessage } from '../../types/communication';
import { useInterns } from '../../context/InternsContext';
import { useInstructors } from '../../context/InstructorsContext';

interface ChatWorkspaceProps {
  defaultRole?: 'ADMIN' | 'INTERN' | 'INSTRUCTOR';
  defaultSenderId?: string;
  defaultSenderName?: string;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  defaultRole = 'ADMIN',
  defaultSenderId = 'admin-1',
  defaultSenderName = 'Admin Operations',
}) => {
  const { chatThreads, messages, activeThreadId, setActiveThreadId, sendChatMessage, markThreadRead } =
    useCommunication();
  const { interns } = useInterns();
  const { instructors } = useInstructors();

  // Active persona (allows testing communication across roles seamlessly)
  const [currentUserRole, setCurrentUserRole] = useState<'ADMIN' | 'INTERN' | 'INSTRUCTOR'>(defaultRole);
  const [currentUserId, setCurrentUserId] = useState<string>(defaultSenderId);
  const [currentUserName, setCurrentUserName] = useState<string>(defaultSenderName);

  const [inputContent, setInputContent] = useState<string>('');
  const [isInstruction, setIsInstruction] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: string; type: string }>>([]);
  const [showNewDmModal, setShowNewDmModal] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active thread lookup
  const activeThread = chatThreads.find((t) => t.id === activeThreadId) || chatThreads[0];
  const activeMessages = (activeThread ? messages[activeThread.id] : []) || [];

  // Scroll to bottom when new message arrives or thread changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (activeThread) {
      markThreadRead(activeThread.id);
    }
  }, [activeThreadId, activeMessages.length]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputContent.trim() && attachedFiles.length === 0) return;

    sendChatMessage(
      activeThread.id,
      inputContent,
      {
        id: currentUserId,
        name: currentUserName,
        role: currentUserRole,
      },
      {
        isInstruction,
        isOfficial: currentUserRole === 'ADMIN' || currentUserRole === 'INSTRUCTOR',
        attachments: attachedFiles.length > 0 ? attachedFiles : undefined,
      }
    );

    setInputContent('');
    setIsInstruction(false);
    setAttachedFiles([]);
  };

  const handleAddSampleAttachment = () => {
    const sampleFiles = [
      { name: 'Sprint-Milestone-Checklist.pdf', size: '1.2 MB', type: 'PDF' },
      { name: 'Architecture-Diagram-v2.png', size: '2.4 MB', type: 'PNG' },
      { name: 'Internship-Evaluation-Form.docx', size: '850 KB', type: 'DOCX' },
    ];
    const picked = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
    setAttachedFiles((prev) => [...prev, picked]);
  };

  const handlePersonaChange = (role: 'ADMIN' | 'INTERN' | 'INSTRUCTOR') => {
    setCurrentUserRole(role);
    if (role === 'ADMIN') {
      setCurrentUserId('admin-1');
      setCurrentUserName('Admin Operations');
    } else if (role === 'INTERN') {
      setCurrentUserId('int-1');
      setCurrentUserName('Sarah Jenkins');
    } else if (role === 'INSTRUCTOR') {
      setCurrentUserId('inst-1');
      setCurrentUserName('Dr. Robert Vance');
    }
  };

  // Filter threads by search
  const filteredThreads = chatThreads.filter((t) =>
    t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const channelThreads = filteredThreads.filter((t) => t.type === 'CHANNEL');
  const directThreads = filteredThreads.filter((t) => t.type === 'DIRECT');

  const quickReplies = [
    'Acknowledged and will submit today.',
    'Please review the attached progress log.',
    'Confirmed. Attendance record reconciled.',
    'Requesting a 15-min sync with supervisor.',
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col md:flex-row h-[720px] max-h-[80vh]">
      {/* Left Channels & Direct Messages Sidebar */}
      <div className="w-full md:w-72 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
        {/* Sidebar Header & Persona Switcher */}
        <div className="p-3.5 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Official Channels
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Live
            </span>
          </div>

          {/* Perspective Selector for Multi-User Testing */}
          <div className="bg-slate-100 p-1.5 rounded-lg text-xs">
            <div className="text-[10px] text-slate-500 font-semibold mb-1 flex items-center justify-between">
              <span>Acting as:</span>
              <span className="text-blue-600 font-bold">{currentUserName}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => handlePersonaChange('ADMIN')}
                className={`py-1 px-1.5 rounded text-[11px] font-semibold text-center transition-colors cursor-pointer ${
                  currentUserRole === 'ADMIN'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handlePersonaChange('INSTRUCTOR')}
                className={`py-1 px-1.5 rounded text-[11px] font-semibold text-center transition-colors cursor-pointer ${
                  currentUserRole === 'INSTRUCTOR'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                Instructor
              </button>
              <button
                type="button"
                onClick={() => handlePersonaChange('INTERN')}
                className={`py-1 px-1.5 rounded text-[11px] font-semibold text-center transition-colors cursor-pointer ${
                  currentUserRole === 'INTERN'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                Intern
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-2.5 border-b border-slate-200 bg-white/50">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter channels or DMs..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-md outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Thread Lists (Channels & Direct Messages) */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Official Channels */}
          <div>
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Department Channels</span>
              <span className="text-[10px] font-normal">{channelThreads.length}</span>
            </div>
            <div className="space-y-0.5 mt-1">
              {channelThreads.map((thread) => {
                const isActive = thread.id === activeThreadId;
                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setActiveThreadId(thread.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-start gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-900 font-bold border-l-3 border-blue-600'
                        : 'text-slate-700 hover:bg-slate-200/60 font-medium'
                    }`}
                  >
                    <Hash className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{thread.title}</span>
                        {thread.unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-600 text-white font-bold">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                      {thread.lastMessage && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                          {thread.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Messages */}
          <div>
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Direct Messages</span>
              <span className="text-[10px] font-normal">{directThreads.length}</span>
            </div>
            <div className="space-y-0.5 mt-1">
              {directThreads.map((thread) => {
                const isActive = thread.id === activeThreadId;
                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setActiveThreadId(thread.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-start gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-900 font-bold border-l-3 border-blue-600'
                        : 'text-slate-700 hover:bg-slate-200/60 font-medium'
                    }`}
                  >
                    <div className="relative shrink-0 mt-0.5">
                      <div className="w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-700">
                        {thread.title.charAt(0)}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{thread.title}</span>
                      </div>
                      {thread.lastMessage && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                          {thread.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Security Notice */}
        <div className="p-3 border-t border-slate-200 text-[11px] text-slate-500 bg-white flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Official IMS Encrypted Channel</span>
        </div>
      </div>

      {/* Main Right Chat Area */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {/* Chat Thread Header */}
        <div className="h-15 px-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shrink-0">
              {activeThread?.type === 'CHANNEL' ? <Hash className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 truncate">{activeThread?.title}</h2>
                {activeThread?.isOfficial && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    Official Channel
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {activeThread?.description || 'Direct communication thread'}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{activeThread?.participants.length || 2} members</span>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/40">
          {activeMessages.length > 0 ? (
            activeMessages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Sender Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                      msg.senderRole === 'ADMIN'
                        ? 'bg-blue-600 text-white'
                        : msg.senderRole === 'INSTRUCTOR'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-purple-600 text-white'
                    }`}
                  >
                    {msg.senderName.charAt(0)}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`max-w-lg ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {/* Header info */}
                    <div className="flex items-center gap-1.5 mb-1 text-[11px]">
                      <span className="font-bold text-slate-800">{msg.senderName}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                          msg.senderRole === 'ADMIN'
                            ? 'bg-blue-100 text-blue-800'
                            : msg.senderRole === 'INSTRUCTOR'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {msg.senderRole}
                      </span>
                      <span className="text-slate-400 text-[10px]">{msg.timestamp}</span>
                    </div>

                    {/* Bubble Content */}
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        msg.isInstruction
                          ? 'bg-amber-50 border border-amber-300 text-slate-900 rounded-tl-sm'
                          : isMe
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                      }`}
                    >
                      {msg.isInstruction && (
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-1">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Official Work Instruction
                        </div>
                      )}

                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/50 space-y-1.5">
                          {msg.attachments.map((att, idx) => (
                            <div
                              key={idx}
                              className={`p-2 rounded flex items-center justify-between gap-2 text-[11px] ${
                                isMe ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate font-semibold">{att.name}</span>
                              </div>
                              <span className="text-[10px] opacity-75 shrink-0">{att.size}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <MessageSquare className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
              <p className="text-xs font-semibold text-slate-700">No messages in this channel yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                Start an official conversation, post work instructions, or share project milestones.
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Response Chips */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] text-slate-400 font-semibold shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-600" /> Quick:
          </span>
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInputContent(reply)}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Attached Files Preview Bar */}
        {attachedFiles.length > 0 && (
          <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[11px] font-bold text-blue-900">Attached:</span>
            {attachedFiles.map((file, idx) => (
              <div
                key={idx}
                className="bg-white border border-blue-200 px-2 py-1 rounded text-[11px] flex items-center gap-1.5 text-slate-700"
              >
                <FileText className="w-3 h-3 text-blue-600" />
                <span>{file.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-slate-400 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Message Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Type a message as ${currentUserName}... (Press Enter to send)`}
                rows={2}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white resize-none"
              />
            </div>

            {/* Input Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddSampleAttachment}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors text-xs flex items-center gap-1 cursor-pointer"
                  title="Attach file or milestone document"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Attach File</span>
                </button>

                {(currentUserRole === 'ADMIN' || currentUserRole === 'INSTRUCTOR') && (
                  <button
                    type="button"
                    onClick={() => setIsInstruction(!isInstruction)}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                      isInstruction
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <span>Instruction Mode</span>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={!inputContent.trim() && attachedFiles.length === 0}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  inputContent.trim() || attachedFiles.length > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
