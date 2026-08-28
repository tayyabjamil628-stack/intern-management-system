import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Send,
  Download,
  Search,
  Filter,
  Users,
  Smartphone,
  Bell,
  AlertTriangle,
  MessageSquare,
  RefreshCw,
  UserCheck,
  Building2,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { BroadcastRecord, RecipientResponse, RecipientStatus } from '../../types/communication';
import { useCommunication } from '../../context/CommunicationContext';

interface BroadcastResponsesModalProps {
  isOpen: boolean;
  onClose: () => void;
  broadcast: BroadcastRecord | null;
}

export const BroadcastResponsesModal: React.FC<BroadcastResponsesModalProps> = ({
  isOpen,
  onClose,
  broadcast,
}) => {
  const { resendReminder } = useCommunication();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  if (!broadcast) return null;

  const responses = broadcast.responses || [];
  const total = broadcast.totalRecipients || responses.length || 1;
  const acknowledged = broadcast.acknowledgedCount || responses.filter((r) => r.acknowledged).length;
  const acknowledgedPercent = Math.round((acknowledged / total) * 100);
  const pendingCount = total - acknowledged;

  const filteredResponses = responses.filter((r) => {
    const matchesSearch =
      r.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.recipientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.recipientDepartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.responseText && r.responseText.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACKNOWLEDGED' && r.acknowledged) ||
      (statusFilter === 'PENDING' && !r.acknowledged) ||
      (statusFilter === 'READ' && r.status === 'READ');

    const matchesRole = roleFilter === 'ALL' || r.recipientRole === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleResendToAllPending = () => {
    resendReminder(broadcast.id);
    setReminderToast(`SMS and In-App reminder dispatched to all ${pendingCount} pending recipients.`);
    setTimeout(() => setReminderToast(null), 4000);
  };

  const handleResendSingle = (recipientId: string, name: string) => {
    resendReminder(broadcast.id, recipientId);
    setReminderToast(`Reminder resent to ${name}.`);
    setTimeout(() => setReminderToast(null), 3000);
  };

  const handleExportCSV = () => {
    const headers = ['Recipient ID', 'Name', 'Role', 'Department', 'Phone/Email', 'Status', 'Acknowledged', 'Acknowledged At', 'Response Text'];
    const rows = responses.map((r) => [
      r.recipientId,
      r.recipientName,
      r.recipientRole,
      r.recipientDepartment,
      r.phone || r.email || 'N/A',
      r.status,
      r.acknowledged ? 'YES' : 'NO',
      r.acknowledgedAt || 'N/A',
      `"${(r.responseText || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `broadcast-responses-${broadcast.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recipient Responses & Acknowledgment Log"
      description={`Tracking live delivery and responses for: "${broadcast.title}"`}
      className="max-w-5xl"
    >
      <div className="space-y-6">
        {/* Toast Alert */}
        {reminderToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {reminderToast}
            </span>
            <button onClick={() => setReminderToast(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Summary Banner */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  {broadcast.type}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 flex items-center gap-1">
                  {broadcast.channel === 'SMS' ? (
                    <Smartphone className="w-3 h-3 text-slate-500" />
                  ) : broadcast.channel === 'NOTIFICATION' ? (
                    <Bell className="w-3 h-3 text-slate-500" />
                  ) : (
                    <>
                      <Smartphone className="w-3 h-3 text-slate-500" />
                      <Bell className="w-3 h-3 text-slate-500" />
                    </>
                  )}
                  {broadcast.channel}
                </span>
                {broadcast.urgent && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Urgent Alert
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">{broadcast.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sent by <span className="font-semibold text-slate-700">{broadcast.senderName}</span> on{' '}
                {new Date(broadcast.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={handleExportCSV}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Export CSV
              </Button>
              {pendingCount > 0 && (
                <Button
                  variant="primary"
                  onClick={handleResendToAllPending}
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Resend to Pending ({pendingCount})
                </Button>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Target</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">{total} recipients</div>
            </div>

            <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Delivered</div>
              <div className="text-base font-bold text-emerald-600 mt-0.5">
                {broadcast.deliveredCount || total} (100%)
              </div>
            </div>

            <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Acknowledged</div>
              <div className="text-base font-bold text-blue-600 mt-0.5">
                {acknowledged} ({acknowledgedPercent}%)
              </div>
            </div>

            <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Pending Action</div>
              <div className="text-base font-bold text-amber-600 mt-0.5">
                {pendingCount} remaining
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-slate-600 font-medium mb-1">
              <span>Acknowledgment Progress</span>
              <span>{acknowledged} of {total} responded ({acknowledgedPercent}%)</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${acknowledgedPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Message Content View */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Dispatched Message Content
          </div>
          <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
            {broadcast.message}
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search recipient, ID, or response..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-blue-500 font-medium text-slate-700"
            >
              <option value="ALL">All Roles</option>
              <option value="INTERN">Internees Only</option>
              <option value="INSTRUCTOR">Instructors Only</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-blue-500 font-medium text-slate-700"
            >
              <option value="ALL">All Response Statuses</option>
              <option value="ACKNOWLEDGED">Acknowledged & Responded</option>
              <option value="PENDING">Pending Acknowledgment</option>
              <option value="READ">Read (Pending Reply)</option>
            </select>
          </div>
        </div>

        {/* Responses Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Role & Dept</th>
                  <th className="py-3 px-4">Delivery & Read</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Response / Feedback</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredResponses.length > 0 ? (
                  filteredResponses.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{r.recipientName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{r.recipientId}</div>
                        {r.phone && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Smartphone className="w-2.5 h-2.5" />
                            {r.phone}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.recipientRole === 'INTERN'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {r.recipientRole}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {r.recipientDepartment}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[11px] text-slate-700">
                          Delivered: {new Date(r.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {r.readAt ? (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Read: {new Date(r.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        ) : (
                          <div className="text-[10px] text-amber-600 font-medium mt-0.5">Unread</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {r.acknowledged ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Acknowledged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                        {r.acknowledgedAt && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            {new Date(r.acknowledgedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        {r.responseText ? (
                          <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px] text-slate-700 italic">
                            "{r.responseText}"
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">No written feedback</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!r.acknowledged && (
                          <button
                            type="button"
                            onClick={() => handleResendSingle(r.recipientId, r.recipientName)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors cursor-pointer"
                            title="Resend SMS reminder to this recipient"
                          >
                            <Send className="w-3 h-3 text-blue-600" />
                            <span>Remind</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No recipient records match the selected filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <span className="text-xs text-slate-500">
            Showing {filteredResponses.length} of {responses.length} recipients
          </span>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};