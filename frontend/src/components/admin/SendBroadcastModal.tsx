import React, { useState } from 'react';
import {
  Send,
  MessageSquare,
  Bell,
  Smartphone,
  AlertTriangle,
  Clock,
  Building2,
  Users,
  CheckCircle2,
  FileText,
  Sparkles,
  Search,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { useCommunication } from '../../context/CommunicationContext';
import { useInterns } from '../../context/InternsContext';
import { useInstructors } from '../../context/InstructorsContext';
import { BroadcastType, TargetAudienceType } from '../../types/communication';

interface SendBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const templates = [
  {
    name: 'Mid-Term Evaluation Due',
    type: 'INSTRUCTION' as BroadcastType,
    channel: 'BOTH' as const,
    title: 'Mid-Term Evaluation & Milestone Submission Guidelines',
    message:
      'All interns and supervisors are required to complete the Q1 Mid-Term Evaluation by Friday 5:00 PM. Please review project milestones and submit your self-assessment through the portal.',
    requireAck: true,
    urgent: true,
  },
  {
    name: 'Mandatory Security SMS',
    type: 'SMS' as BroadcastType,
    channel: 'SMS' as const,
    title: 'SMS Alert: Mandatory Security Protocol Training',
    message:
      'SMS Notice: All interns must complete the 2-step VPN and GitHub token security onboarding before accessing internal repositories.',
    requireAck: true,
    urgent: true,
  },
  {
    name: 'Holiday Schedule Notice',
    type: 'ANNOUNCEMENT' as BroadcastType,
    channel: 'NOTIFICATION' as const,
    title: 'Company-Wide Holiday Schedule Announcement',
    message:
      'The office and virtual lab infrastructure will operate on reduced support during the upcoming Spring Recess. Automated attendance check-in is paused during this period.',
    requireAck: false,
    urgent: false,
  },
  {
    name: 'Attendance Reminder',
    type: 'INSTRUCTION' as BroadcastType,
    channel: 'BOTH' as const,
    title: 'Weekly Attendance Verification Reminder',
    message:
      'Please verify and submit your daily attendance records for this week before 6:00 PM today. Supervisors will review submissions tonight.',
    requireAck: true,
    urgent: false,
  },
];

export const SendBroadcastModal: React.FC<SendBroadcastModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { sendBroadcast } = useCommunication();
  const { interns } = useInterns();
  const { instructors } = useInstructors();

  const [channel, setChannel] = useState<'SMS' | 'NOTIFICATION' | 'BOTH'>('BOTH');
  const [type, setType] = useState<BroadcastType>('INSTRUCTION');
  const [targetAudience, setTargetAudience] = useState<TargetAudienceType>('ALL');
  const [targetDepartment, setTargetDepartment] = useState<string>('Software Engineering');
  const [selectedCustomIds, setSelectedCustomIds] = useState<string[]>([]);
  const [customSearch, setCustomSearch] = useState<string>('');

  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [requireAck, setRequireAck] = useState<boolean>(true);
  const [ackDeadline, setAckDeadline] = useState<string>('');
  const [urgent, setUrgent] = useState<boolean>(false);
  const [previewTab, setPreviewTab] = useState<'sms' | 'notification'>('sms');

  const [errors, setErrors] = useState<{ title?: string; message?: string }>({});

  const applyTemplate = (tpl: typeof templates[0]) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    setType(tpl.type);
    setChannel(tpl.channel);
    setRequireAck(tpl.requireAck);
    setUrgent(tpl.urgent);
    setErrors({});
  };

  const handleToggleCustomRecipient = (id: string) => {
    setSelectedCustomIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllCustom = () => {
    const allIds = [
      ...interns.map((i) => i.internId),
      ...instructors.map((ins) => ins.instructorId),
    ];
    setSelectedCustomIds(allIds);
  };

  const handleClearAllCustom = () => {
    setSelectedCustomIds([]);
  };

  const validate = () => {
    const errs: { title?: string; message?: string } = {};
    if (!title.trim()) errs.title = 'Title / Subject is required';
    if (!message.trim()) errs.message = 'Message body is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    sendBroadcast({
      title,
      message,
      type,
      channel,
      targetAudience,
      targetDepartment: targetAudience === 'DEPARTMENT' ? targetDepartment : undefined,
      customRecipientIds: targetAudience === 'CUSTOM' ? selectedCustomIds : undefined,
      senderName: 'Admin Operations',
      senderRole: 'System Administrator',
      requireAcknowledgment: requireAck,
      acknowledgmentDeadline: ackDeadline || undefined,
      urgent,
    });

    onClose();
    if (onSuccess) onSuccess();
  };

  // Character counter for SMS calculation
  const charCount = message.length;
  const smsSegments = Math.ceil(charCount / 160) || 1;

  // Filter custom recipients for search
  const filteredInterns = interns.filter(
    (i) =>
      i.fullName.toLowerCase().includes(customSearch.toLowerCase()) ||
      i.internId.toLowerCase().includes(customSearch.toLowerCase()) ||
      i.department.toLowerCase().includes(customSearch.toLowerCase())
  );

  const filteredInstructors = instructors.filter(
    (ins) =>
      ins.fullName.toLowerCase().includes(customSearch.toLowerCase()) ||
      ins.instructorId.toLowerCase().includes(customSearch.toLowerCase()) ||
      ins.department.toLowerCase().includes(customSearch.toLowerCase())
  );

  // Recipient estimation count
  const estimatedRecipientCount = () => {
    if (targetAudience === 'ALL') return interns.length + instructors.length;
    if (targetAudience === 'INTERNS') return interns.length;
    if (targetAudience === 'INSTRUCTORS') return instructors.length;
    if (targetAudience === 'DEPARTMENT') {
      const matchInterns = interns.filter((i) => i.department === targetDepartment).length;
      const matchInstructors = instructors.filter((ins) => ins.department === targetDepartment).length;
      return matchInterns + matchInstructors;
    }
    if (targetAudience === 'CUSTOM') return selectedCustomIds.length;
    return 0;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send SMS, Notification or Instruction"
      description="Broadcast official announcements, urgent SMS alerts, and actionable instructions to internees and instructors."
      className="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quick Templates Bar */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Quick Templates
            </span>
            <span className="text-[11px] text-slate-400">Click to autofill fields</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {templates.map((tpl) => (
              <button
                key={tpl.name}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="px-2.5 py-1 text-xs bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-md transition-colors font-medium flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3 h-3 text-slate-400" />
                {tpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Dispatch Channel */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Delivery Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChannel('BOTH')}
                className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                  channel === 'BOTH'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-center gap-1 mb-1">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <Bell className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xs font-bold">SMS + App</div>
                <div className="text-[10px] text-slate-500">Max Reach</div>
              </button>

              <button
                type="button"
                onClick={() => setChannel('SMS')}
                className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                  channel === 'SMS'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <div className="text-xs font-bold">SMS Only</div>
                <div className="text-[10px] text-slate-500">Direct Phone</div>
              </button>

              <button
                type="button"
                onClick={() => setChannel('NOTIFICATION')}
                className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                  channel === 'NOTIFICATION'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Bell className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <div className="text-xs font-bold">In-App Push</div>
                <div className="text-[10px] text-slate-500">Portal Banner</div>
              </button>
            </div>
          </div>

          {/* Broadcast Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              2. Message Category
            </label>
            <Select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value as BroadcastType)}
              options={[
                { value: 'INSTRUCTION', label: '📋 Actionable Instruction (Task / Workflow)' },
                { value: 'ANNOUNCEMENT', label: '📢 General Official Announcement' },
                { value: 'SMS', label: '📱 Direct SMS Notice / Alert' },
                { value: 'NOTIFICATION', label: '🔔 System Notice & Check-in' },
              ]}
            />
          </div>
        </div>

        {/* Target Audience Selector */}
        <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              3. Target Audience
            </label>
            <span className="text-xs font-semibold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
              Estimated: {estimatedRecipientCount()} recipient(s)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'ALL', label: 'Everyone (All)' },
              { id: 'INTERNS', label: 'All Internees' },
              { id: 'INSTRUCTORS', label: 'All Instructors' },
              { id: 'DEPARTMENT', label: 'By Department' },
              { id: 'CUSTOM', label: 'Select Specific' },
            ].map((aud) => (
              <button
                key={aud.id}
                type="button"
                onClick={() => setTargetAudience(aud.id as TargetAudienceType)}
                className={`py-2 px-2.5 rounded-md text-xs font-semibold text-center border transition-colors cursor-pointer ${
                  targetAudience === aud.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {aud.label}
              </button>
            ))}
          </div>

          {/* Department Sub-select */}
          {targetAudience === 'DEPARTMENT' && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Select Target Department
              </label>
              <Select
                name="targetDepartment"
                value={targetDepartment}
                onChange={(e) => setTargetDepartment(e.target.value)}
                options={[
                  { value: 'Software Engineering', label: 'Software Engineering' },
                  { value: 'Product Design', label: 'Product Design' },
                  { value: 'Data Analytics', label: 'Data Analytics' },
                  { value: 'Quality Assurance', label: 'Quality Assurance' },
                  { value: 'Marketing', label: 'Marketing' },
                  { value: 'Human Resources', label: 'Human Resources' },
                ]}
              />
            </div>
          )}

          {/* Custom Multi-select List */}
          {targetAudience === 'CUSTOM' && (
            <div className="pt-2 space-y-2 bg-white p-3 border border-slate-200 rounded-md">
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search intern or instructor..."
                    value={customSearch}
                    onChange={(e) => setCustomSearch(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSelectAllCustom}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleClearAllCustom}
                  className="text-xs text-slate-500 hover:underline"
                >
                  Clear
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded">
                <div className="bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-500 uppercase">
                  Internees ({filteredInterns.length})
                </div>
                {filteredInterns.map((i) => (
                  <label
                    key={i.internId}
                    className="flex items-center justify-between p-2 hover:bg-slate-50 text-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCustomIds.includes(i.internId)}
                        onChange={() => handleToggleCustomRecipient(i.internId)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-semibold text-slate-800">{i.fullName}</span>
                      <span className="text-[11px] text-slate-400">({i.internId})</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{i.department}</span>
                  </label>
                ))}

                <div className="bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-500 uppercase">
                  Instructors ({filteredInstructors.length})
                </div>
                {filteredInstructors.map((ins) => (
                  <label
                    key={ins.instructorId}
                    className="flex items-center justify-between p-2 hover:bg-slate-50 text-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCustomIds.includes(ins.instructorId)}
                        onChange={() => handleToggleCustomRecipient(ins.instructorId)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-semibold text-slate-800">{ins.fullName}</span>
                      <span className="text-[11px] text-slate-400">({ins.instructorId})</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{ins.department}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Message Content & Live Preview Tabs */}
        <div className="space-y-4">
          <Input
            label="Message Title / Subject"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Mid-Term Evaluation & Milestone Submission Guidelines"
            required
            error={errors.title}
          />

          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Message Body <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500">
                {charCount} chars • {smsSegments} SMS segment{smsSegments > 1 ? 's' : ''}
              </span>
            </div>

            <Textarea
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your official message, instruction, or announcement here..."
              rows={4}
              required
              error={errors.message}
            />
          </div>

          {/* Interactive Live Preview Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                Live Recipient Preview
              </span>
              <div className="flex gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewTab('sms')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                    previewTab === 'sms'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  SMS View
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('notification')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                    previewTab === 'notification'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  App Banner View
                </button>
              </div>
            </div>

            {previewTab === 'sms' ? (
              <div className="max-w-md mx-auto bg-white border border-slate-300 rounded-xl p-3 shadow-xs font-sans text-xs">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 text-[10px] text-slate-400">
                  <span>IMS-SMS DISPATCH</span>
                  <span>Now</span>
                </div>
                <p className="font-bold text-slate-900 mb-1">{title || 'Message Title'}</p>
                <p className="text-slate-700 leading-relaxed">
                  {message || 'Your message body will be displayed to recipients on their mobile SMS stream.'}
                </p>
                {requireAck && (
                  <div className="mt-2 pt-2 border-t border-dashed border-slate-200 text-[11px] text-blue-700 font-medium">
                    Reply "ACK" to confirm receipt or tap portal link.
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-md mx-auto bg-white border-l-4 border-blue-600 rounded-md p-3 shadow-xs text-xs flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900">{title || 'Notification Title'}</p>
                  <p className="text-slate-600 line-clamp-2 mt-0.5">{message || 'Notification content summary...'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-semibold">
                      View Details & Acknowledge
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Options & Response Tracking Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          {/* Require Acknowledgment */}
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={requireAck}
              onChange={(e) => setRequireAck(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 mt-0.5"
            />
            <div>
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Require Recipient Response / Acknowledgment
              </span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Tracks who confirmed reading and allows internees/instructors to submit replies.
              </p>
            </div>
          </label>

          {/* Urgent Alert Priority */}
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500 mt-0.5"
            />
            <div>
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Mark as High Priority / Urgent Alert
              </span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Displays prominent alert badge on portals and sends priority SMS.
              </p>
            </div>
          </label>

          {requireAck && (
            <div className="sm:col-span-2 pt-2 border-t border-slate-200 flex items-center gap-3">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-medium text-slate-700">Response Deadline (Optional):</span>
                <input
                  type="date"
                  value={ackDeadline}
                  onChange={(e) => setAckDeadline(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            icon={<Send className="w-4 h-4" />}
            className="min-w-[140px]"
          >
            Dispatch Now
          </Button>
        </div>
      </form>
    </Modal>
  );
};
