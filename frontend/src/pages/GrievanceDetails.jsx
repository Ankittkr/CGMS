import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchGrievanceById,
  reopenGrievance,
  submitFeedback,
  updateGrievanceStatus,
} from '../redux/slices/grievanceSlice.js';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import Modal from '../components/Modal.jsx';
import FormInput from '../components/FormInput.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import {
  ArrowLeft,
  RotateCcw,
  Star,
  CheckCircle2,
  Clock,
  User,
  Building,
  FileText,
  AlertCircle,
  Paperclip,
} from 'lucide-react';

const LIFECYCLE_STAGES = [
  'Submitted',
  'Grievance Processing',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
];

const GrievanceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, role } = useSelector((state) => state.auth);
  const { currentGrievance, feedback, isLoading } = useSelector(
    (state) => state.grievance
  );

  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchGrievanceById(id));
    }
  }, [dispatch, id]);

  const handleReopen = async (e) => {
    e.preventDefault();
    if (reopenReason && id) {
      await dispatch(reopenGrievance({ id, reason: reopenReason }));
      setIsReopenModalOpen(false);
      dispatch(fetchGrievanceById(id));
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (id) {
      setIsSubmittingFeedback(true);
      await dispatch(submitFeedback({ id, rating, comments: feedbackComment }));
      setIsSubmittingFeedback(false);
      dispatch(fetchGrievanceById(id));
    }
  };

  const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown size';

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

  if (isLoading || !currentGrievance) {
    return <LoadingSpinner fullPage message="Fetching complaint details..." />;
  }

  const isComplainant =
    user?._id === currentGrievance.complainant?._id || role === 'student';
  const isResolvedOrClosed = ['Resolved', 'Closed'].includes(currentGrievance.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar with Back Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Complaints
        </button>

        <div className="flex items-center gap-2">
          {isComplainant && isResolvedOrClosed && (
            <button
              type="button"
              onClick={() => setIsReopenModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw size={13} /> Reopen Grievance
            </button>
          )}
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-5 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="font-mono text-base font-bold text-blue-600">
                #{currentGrievance.grievanceId}
              </span>
              <PriorityBadge priority={currentGrievance.priority} />
            </div>
            <h1 className="text-lg font-bold text-slate-900 leading-snug">
              {currentGrievance.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Category: <strong>{currentGrievance.category?.name || 'General'}</strong> • Target Department: <strong>{currentGrievance.department?.name}</strong>
            </p>
          </div>
          <div className="shrink-0">
            <StatusBadge status={currentGrievance.status} />
          </div>
        </div>

        {/* Visual Lifecycle Stepper */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Lifecycle Milestone Progression
          </p>
          <div className="flex items-center justify-between text-xs font-medium overflow-x-auto py-2">
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const isPassed =
                LIFECYCLE_STAGES.indexOf(currentGrievance.status) >= idx ||
                currentGrievance.status === stage;
              const isCurrent = currentGrievance.status === stage;

              return (
                <div
                  key={stage}
                  className={`flex flex-col items-center gap-1 min-w-[70px] ${
                    isCurrent
                      ? 'text-blue-600 font-bold'
                      : isPassed
                      ? 'text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className="text-[11px] text-center leading-tight">{stage}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Narrative Description */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Statement of Grievance
          </h3>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
            {currentGrievance.description}
          </div>
        </div>


        {/* Supporting Evidence / Attachments */}
        {currentGrievance.attachments?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Attached Evidence ({currentGrievance.attachments.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentGrievance.attachments.map((att, idx) => {
                const isImage =
                  att.fileType?.startsWith('image/') ||
                  att.resourceType === 'image';

                const isPdf =
                  att.fileType === 'application/pdf' ||
                  att.format === 'pdf';

                return (
                  <div
                    key={att.publicId || att.url || idx}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white"
                  >
                    {/* Image Preview */}
                    {isImage && att.url && (
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-slate-50"
                      >
                        <img
                          src={att.url}
                          alt={att.filename}
                          className="w-full h-40 object-contain"
                          loading="lazy"
                        />
                      </a>
                    )}

                    <div className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip
                          size={16}
                          className="text-blue-600 shrink-0"
                        />

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {att.filename}
                          </p>

                          <p className="text-[10px] text-slate-400">
                            {att.format?.toUpperCase() || 'FILE'} •{' '}
                            {formatFileSize(att.size)}
                          </p>
                        </div>
                      </div>

                      {att.url && (
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          {isPdf ? 'View PDF' : 'Open'}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* Official Resolution Summary (if resolved) */}
        {currentGrievance.resolutionDetails?.resolutionNotes && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
            <h3 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 size={16} /> Official Resolution Summary
            </h3>
            <p className="text-xs text-emerald-900 leading-relaxed">
              {currentGrievance.resolutionDetails.resolutionNotes}
            </p>
            <p className="text-[11px] text-emerald-700">
              Resolved by {currentGrievance.resolutionDetails.resolvedBy?.name || 'Assigned Resolver'} on{' '}
              {new Date(currentGrievance.resolutionDetails.resolvedAt).toLocaleString()}
            </p>
          </div>
        )}

        {/* Complainant & Resolver Personnel Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              Complainant Information
            </span>
            <p className="font-semibold text-slate-800">
              {currentGrievance.complainant?.name} ({currentGrievance.complainant?.rollOrEmployeeId})
            </p>
            <p className="text-slate-500">{currentGrievance.complainant?.email}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              Assigned Resolver Desk
            </span>
            <p className="font-semibold text-slate-800">
              {currentGrievance.assignedTo?.name || 'Pending Allocation'}
            </p>
            <p className="text-slate-500">
              {currentGrievance.assignedTo?.email || 'Will be routed by Department Head'}
            </p>
          </div>
        </div>

        {/* Audit Status History Timeline */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Milestone Audit History
          </h3>
          <div className="space-y-3">
            {currentGrievance.statusHistory?.map((h, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 text-xs border-l-2 border-blue-500 pl-3.5 py-1"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">
                      {h.newStatus}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • {new Date(h.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{h.remarks}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resolution Feedback Card (Student only) */}
      {isComplainant && isResolvedOrClosed && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
            <Star size={16} className="text-amber-500" />
            Complainant Resolution Feedback
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Rate your satisfaction with the department resolver turnaround and remediation quality.
          </p>

          {feedback ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                {[...Array(feedback.rating || 5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
                <span className="text-slate-700 ml-1.5">{feedback.rating} / 5 Stars</span>
              </div>
              <p className="text-slate-700">{feedback.comments || 'No comment provided.'}</p>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        size={20}
                        className={
                          star <= rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <FormInput
                label="Comments on Resolution"
                name="feedbackComment"
                type="textarea"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Share your experience regarding communication, response time and fix..."
                rows={2}
              />

              <button
                type="submit"
                disabled={isSubmittingFeedback}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmittingFeedback ? 'Submitting...' : 'Submit Resolution Feedback'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Reopen Modal */}
      <Modal
        isOpen={isReopenModalOpen}
        onClose={() => setIsReopenModalOpen(false)}
        title={`Reopen Grievance #${currentGrievance.grievanceId}`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsReopenModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReopen}
              disabled={!reopenReason}
              className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer disabled:opacity-50"
            >
              Submit Reopen Request
            </button>
          </>
        }
      >
        <form onSubmit={handleReopen} className="space-y-4">
          <p className="text-xs text-slate-600">
            Explain why the provided resolution was incomplete or if the problem has recurred:
          </p>
          <FormInput
            label="Reason for Reopening"
            name="reopenReason"
            type="textarea"
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            placeholder="Describe persisting faults, missing parts, or unaddressed issues..."
            required
            rows={3}
          />
        </form>
      </Modal>
    </div>
  );
};

export default GrievanceDetails;
