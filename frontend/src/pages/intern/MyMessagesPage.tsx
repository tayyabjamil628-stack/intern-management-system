import React, { useState } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Building2,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { useCommunication } from '../../context/CommunicationContext';
import { ChatWorkspace } from '../../components/communication/ChatWorkspace';

export const MyMessagesPage: React.FC = () => {
  const { broadcasts, acknowledgeBroadcast } = useCommunication();
  const currentInternId = 'INT-2026-001';
  const currentInternName = 'Sarah Jenkins';

  const [responseInputs, setResponseInputs] = useState<Record<string, string>>({});
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filter instructions & announcements relevant to this intern
  const relevantBroadcasts = broadcasts.filter(
    (b) =>
      b.targetAudience === 'ALL' ||
      b.targetAudience === 'INTERNS' ||
      (b.targetAudience === 'DEPARTMENT' && b.targetDepartment === 'Software Engineering') ||
      (b.targetAudience === 'CUSTOM' && b.customRecipientIds?.includes(currentInternId))
  );

  const pendingAcks = relevantBroadcasts.filter((b) => {
    if (!b.requireAcknowledgment) return false;
    const resp = b.responses.find((r) => r.recipientId === currentInternId);
    return !resp || !resp.acknowledged;
  });

  const handleAcknowledge = (broadcastId: string) => {
    const text = responseInputs[broadcastId] || 'Acknowledged and noted via intern portal.';
    acknowledgeBroadcast(broadcastId, currentInternId, text);
    setSuccessToast('Your acknowledgment and response have been submitted to Admin & Instructors.');
    setResponseInputs((prev) => ({ ...prev, [broadcastId]: '' }));
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Messages, Instructions & Official Chat"
        description="Official communications from administrators and instructors. Review actionable instructions, submit acknowledgments, and chat in department channels."
      />

      {/* Success Alert */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successToast}
          </span>
        </div>
      )}

      {/* Actionable Instructions Requiring Acknowledgment */}
      {pendingAcks.length > 0 && (
        <div className="p-4 sm:p-5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Action Required: Pending Acknowledgment ({pendingAcks.length})
              </h2>
            </div>
            <span className="text-[11px] text-amber-700 font-medium">Please review & confirm</span>
          </div>

          <div className="space-y-3">
            {pendingAcks.map((b) => (
              <div
                key={b.id}
                className="p-4 bg-white border border-amber-200 rounded-lg shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
                        {b.type}
                      </span>
                      {b.urgent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                          Urgent Priority
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{b.title}</h3>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">{b.message}</p>
                  </div>
                </div>

                {/* Response Input and Confirm button */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    placeholder="Optional response note / update (e.g. 'Completed task & submitted link')..."
                    value={responseInputs[b.id] || ''}
                    onChange={(e) =>
                      setResponseInputs((prev) => ({ ...prev, [b.id]: e.target.value }))
                    }
                    className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-blue-500 focus:bg-white"
                  />
                  <Button
                    variant="primary"
                    onClick={() => handleAcknowledge(b.id)}
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Confirm & Acknowledge
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Workplace Chat */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Official Workplace Channels & Direct Messages
          </h2>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Official IMS Communication Channel
          </span>
        </div>

        <ChatWorkspace
          defaultRole="INTERN"
          defaultSenderId="int-1"
          defaultSenderName="Sarah Jenkins"
        />
      </div>
    </div>
  );
};