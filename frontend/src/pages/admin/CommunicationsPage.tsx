import React, { useState } from 'react';
import {
  Send,
  MessageSquare,
  Smartphone,
  Bell,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Eye,
  Radio,
  Building2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { useCommunication } from '../../context/CommunicationContext';
import { SendBroadcastModal } from '../../components/admin/SendBroadcastModal';
import { BroadcastResponsesModal } from '../../components/admin/BroadcastResponsesModal';
import { ChatWorkspace } from '../../components/communication/ChatWorkspace';
import { BroadcastRecord, BroadcastType } from '../../types/communication';

export const CommunicationsPage: React.FC = () => {
  const { broadcasts, totalPendingAcknowledgments } = useCommunication();

  const [activeTab, setActiveTab] = useState<'broadcasts' | 'chat'>('broadcasts');
  const [isSendModalOpen, setIsSendModalOpen] = useState<boolean>(false);
  const [selectedBroadcastForResponses, setSelectedBroadcastForResponses] = useState<BroadcastRecord | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');

  // Compute metrics
  const totalDispatched = broadcasts.length;
  const totalSmsCount = broadcasts.filter((b) => b.channel === 'SMS' || b.channel === 'BOTH').length;
  const totalRecipientsAll = broadcasts.reduce((acc, b) => acc + (b.totalRecipients || 0), 0);
  const totalAcknowledgedAll = broadcasts.reduce((acc, b) => acc + (b.acknowledgedCount || 0), 0);
  const overallAckRate = totalRecipientsAll > 0 ? Math.round((totalAcknowledgedAll / totalRecipientsAll) * 100) : 100;

  // Filtered broadcasts
  const filteredBroadcasts = broadcasts.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.senderName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'ALL' || b.type === typeFilter;
    const matchesChannel = channelFilter === 'ALL' || b.channel === channelFilter;

    return matchesSearch && matchesType && matchesChannel;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Communications & SMS Dispatch"
        description="Send SMS broadcasts, system notifications, and instructions to internees and instructors. Monitor acknowledgments and conduct official workplace chat."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={() => setIsSendModalOpen(true)}
              icon={<Send className="w-4 h-4" />}
            >
              Send SMS / Notification
            </Button>
          </div>
        }
      />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Broadcasts</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalDispatched}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Across SMS, In-App, and Direct Instructions
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">SMS Dispatched</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalSmsCount} campaigns</div>
          <p className="text-[11px] text-slate-500 mt-1">Direct SMS delivery with 100% gateway reach</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Ack & Response Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{overallAckRate}%</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {totalAcknowledgedAll} of {totalRecipientsAll} total responses logged
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Responses</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {totalPendingAcknowledgments}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Internees/Instructors pending acknowledgment
          </p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('broadcasts')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'broadcasts'
              ? 'bg-white text-blue-600 border-t-2 border-x border-slate-200 -mb-px shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Broadcasts & SMS Dispatches ({broadcasts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-white text-blue-600 border-t-2 border-x border-slate-200 -mb-px shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Official Channels & Chat</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
            Live
          </span>
        </button>
      </div>

      {/* Tab Content 1: Broadcasts and SMS Dispatches */}
      {activeTab === 'broadcasts' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search dispatched broadcasts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="ALL">All Categories</option>
                <option value="INSTRUCTION">Actionable Instructions</option>
                <option value="SMS">SMS Alerts</option>
                <option value="ANNOUNCEMENT">Announcements</option>
                <option value="NOTIFICATION">Portal Notices</option>
              </select>

              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="ALL">All Channels</option>
                <option value="BOTH">SMS + In-App</option>
                <option value="SMS">SMS Only</option>
                <option value="NOTIFICATION">In-App Only</option>
              </select>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsSendModalOpen(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                New Broadcast
              </Button>
            </div>
          </div>

          {/* Broadcasts List */}
          <div className="space-y-3">
            {filteredBroadcasts.length > 0 ? (
              filteredBroadcasts.map((b) => {
                const totalRec = b.totalRecipients || b.responses.length || 1;
                const ackCount = b.acknowledgedCount || b.responses.filter((r) => r.acknowledged).length;
                const ackPercent = Math.round((ackCount / totalRec) * 100);
                const pending = totalRec - ackCount;

                return (
                  <div
                    key={b.id}
                    className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    {/* Left Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            b.type === 'INSTRUCTION'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : b.type === 'SMS'
                              ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                              : b.type === 'ANNOUNCEMENT'
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {b.type}
                        </span>

                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 flex items-center gap-1">
                          {b.channel === 'SMS' ? (
                            <Smartphone className="w-3 h-3 text-slate-500" />
                          ) : b.channel === 'NOTIFICATION' ? (
                            <Bell className="w-3 h-3 text-slate-500" />
                          ) : (
                            <>
                              <Smartphone className="w-3 h-3 text-slate-500" />
                              <Bell className="w-3 h-3 text-slate-500" />
                            </>
                          )}
                          {b.channel}
                        </span>

                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          Audience: {b.targetAudience}
                          {b.targetDepartment && ` (${b.targetDepartment})`}
                        </span>

                        {b.urgent && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Urgent
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mb-1">{b.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {b.message}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
                        <span>Dispatched by: <strong className="text-slate-600">{b.senderName}</strong></span>
                        <span>•</span>
                        <span>{new Date(b.createdAt).toLocaleDateString()} at {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Right Stats & Action */}
                    <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center gap-4 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {/* Acknowledgment metric */}
                      {b.requireAcknowledgment ? (
                        <div className="min-w-[140px]">
                          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                            <span>Acknowledgment</span>
                            <span className="text-blue-600">{ackPercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${ackPercent}%` }}
                            />
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            {ackCount} of {totalRec} responded {pending > 0 && `(${pending} pending)`}
                          </div>
                        </div>
                      ) : (
                        <div className="min-w-[120px] text-xs text-slate-500">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            Info Notice (No ack required)
                          </span>
                          <div className="text-[11px] text-slate-400 mt-1">
                            Delivered to {totalRec} recipients
                          </div>
                        </div>
                      )}

                      {/* Response View Button */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedBroadcastForResponses(b)}
                        icon={<Eye className="w-3.5 h-3.5 text-blue-600" />}
                        className="whitespace-nowrap"
                      >
                        View Responses ({b.responses.length})
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-xl">
                <Radio className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No broadcasts found</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  No SMS or notifications match the current search or filter criteria.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsSendModalOpen(true)}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Create First Broadcast
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content 2: Official Work Chat */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Official Workplace Chat & Channels:</strong> Securely message instructors and internees, assign tasks, and coordinate sprint milestones.
              </span>
            </div>
          </div>

          <ChatWorkspace defaultRole="ADMIN" defaultSenderId="admin-1" defaultSenderName="Admin Operations" />
        </div>
      )}

      {/* Send Broadcast Modal */}
      <SendBroadcastModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
      />

      {/* View Responses Modal */}
      <BroadcastResponsesModal
        isOpen={!!selectedBroadcastForResponses}
        onClose={() => setSelectedBroadcastForResponses(null)}
        broadcast={selectedBroadcastForResponses}
      />
    </div>
  );
};
