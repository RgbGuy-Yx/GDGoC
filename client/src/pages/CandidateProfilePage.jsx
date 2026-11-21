import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getCandidateById, updateShortlistStatus, updateFinalSelectionStatus } from '../api/candidateApi';
import { useAuth } from '../context/AuthContext';
import { EvaluationForm } from '../components/candidates/EvaluationForm';
import { TransferForm } from '../components/candidates/TransferForm';
import { ShortlistBadge, FinalStatusBadge, DomainBadge } from '../components/common/Badge';
import {
  ArrowLeft,
  Mail,
  Phone,
  BookOpen,
  Layers,
  Award,
  ArrowRightLeft,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  MessageSquare,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const CandidateProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [updatingShortlist, setUpdatingShortlist] = useState(false);
  const [updatingFinalStatus, setUpdatingFinalStatus] = useState(false);

  const fetchCandidate = async () => {
    setLoading(true);
    setError('');
    try {
      const searchParams = new URLSearchParams(location.search);
      const params = {};
      const yearFilter = searchParams.get('yearOfStudy') || searchParams.get('year');
      if (yearFilter) params.yearOfStudy = yearFilter;

      const res = await getCandidateById(id, params);
      if (res.success) {
        setCandidate(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load candidate profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
  }, [id, location.search]);

  const handleNavigateCandidate = (targetId) => {
    if (!targetId) return;
    const base = user?.role === 'lead' ? '/lead/candidates' : '/admin/candidates';
    navigate(`${base}/${targetId}${location.search}`);
  };

  const handleShortlistToggle = async (newStatus) => {
    setUpdatingShortlist(true);
    setActionSuccess('');
    setError('');
    try {
      const res = await updateShortlistStatus(candidate._id, newStatus);
      if (res.success) {
        setCandidate((prev) => ({ ...prev, shortlistStatus: newStatus }));
        setActionSuccess(`Candidate shortlist status set to '${newStatus}'.`);
      }
    } catch (err) {
      setError(err.message || 'Failed to update shortlist status.');
    } finally {
      setUpdatingShortlist(false);
    }
  };

  const handleFinalStatusChange = async (newStatus) => {
    setUpdatingFinalStatus(true);
    setActionSuccess('');
    setError('');
    try {
      const res = await updateFinalSelectionStatus(candidate._id, newStatus);
      if (res.success) {
        setCandidate((prev) => ({ ...prev, finalSelectionStatus: newStatus }));
        setActionSuccess(`Candidate final admission status set to '${newStatus}'.`);
      }
    } catch (err) {
      setError(err.message || 'Failed to update final selection status.');
    } finally {
      setUpdatingFinalStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-12 text-center shadow-ambient">
        <div className="w-8 h-8 border-2 border-[#E5E5E5] border-t-[#171717] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#737373] font-medium">Loading candidate profile...</p>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-8 shadow-ambient space-y-4">
        <div className="flex items-center gap-2 text-rose-600">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-semibold text-sm">Failed to Load Candidate</h3>
        </div>
        <p className="text-xs text-[#737373]">{error || 'Candidate not found or access restricted.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full bg-[#F4F4F4] hover:bg-[#E5E5E5] text-[#171717] transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Go Back
        </button>
      </div>
    );
  }

  const isTransferred = candidate.originalDomain !== candidate.currentDomain;
  const leadDomains = user?.domains || [];
  const isCurrentLead = !isAdmin && (
    leadDomains.some((d) => d.toLowerCase() === candidate.currentDomain?.toLowerCase()) ||
    (candidate.assignedLead?._id || candidate.assignedLead) === user?.id
  );

  return (
    <div className="space-y-6">
      {/* Back button & Candidate Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full border border-[#E5E5E5] bg-white hover:bg-[#F4F4F4] text-[#171717] transition-all shadow-2xs shrink-0 mt-0.5 sm:mt-0"
            title="Back to previous list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight">
                {candidate.name || candidate.rollNumber}
              </h2>
              {candidate.name && (
                <span className="text-xs sm:text-sm font-medium text-[#737373]">
                  ({candidate.rollNumber})
                </span>
              )}
              <span className="text-[11px] font-mono bg-[#F4F4F4] text-[#525252] px-2.5 py-0.5 rounded-full border border-[#E5E5E5]">
                {candidate.candidateId}
              </span>
              <ShortlistBadge status={candidate.shortlistStatus} />
              <FinalStatusBadge status={candidate.finalSelectionStatus} />
            </div>
            <p className="text-xs text-[#737373] mt-1">
              Applied: {new Date(candidate.createdAt).toLocaleDateString()} · Year {candidate.yearOfStudy} · {candidate.branch}
            </p>
          </div>
        </div>

        {/* Action Controls & Fast Next/Prev Candidate Navigation */}
        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
          {/* Only authorized active Team Leads can shortlist / unshortlist */}
          {isCurrentLead && (
            <div className="flex items-center gap-2 flex-wrap flex-1 sm:flex-none">
              {candidate.shortlistStatus === 'SHORTLISTED' ? (
                <button
                  disabled={updatingShortlist}
                  onClick={() => handleShortlistToggle('REJECTED')}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-[#FAFAFA] text-[#737373] hover:text-[#171717] border border-[#E5E5E5] transition-all"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  Unshortlist
                </button>
              ) : (
                <button
                  disabled={updatingShortlist}
                  onClick={() => handleShortlistToggle('SHORTLISTED')}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-[#7AF1A7] text-[#171717] hover:bg-[#6be499] active:scale-[0.98] transition-all shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#166534]" />
                  Shortlist
                </button>
              )}

              {candidate.shortlistStatus !== 'PENDING' && (
                <button
                  disabled={updatingShortlist}
                  onClick={() => handleShortlistToggle('PENDING')}
                  className="px-3.5 py-2 text-xs font-medium text-[#525252] hover:bg-[#F4F4F4] border border-[#E5E5E5] rounded-full transition-all"
                >
                  Reset
                </button>
              )}
            </div>
          )}

          {/* Fast Candidate Next / Prev Navigation Widget */}
          <div className="inline-flex items-center p-1 rounded-full bg-white border border-[#E5E5E5] shadow-2xs shrink-0 ml-auto sm:ml-0">
            <button
              type="button"
              onClick={() => handleNavigateCandidate(candidate.navigation?.prev?.id)}
              disabled={!candidate.navigation?.prev}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#525252] hover:text-[#171717] hover:bg-[#F4F4F4] disabled:opacity-35 disabled:hover:bg-transparent transition-all"
              title={
                candidate.navigation?.prev
                  ? `Previous: ${candidate.navigation.prev.name || candidate.navigation.prev.rollNumber}`
                  : 'Start of candidate list'
              }
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {candidate.navigation?.currentIndex && (
              <span className="px-2.5 text-[11px] font-mono font-medium text-[#737373] border-x border-[#E5E5E5]">
                {candidate.navigation.currentIndex} / {candidate.navigation.totalCandidates}
              </span>
            )}

            <button
              type="button"
              onClick={() => handleNavigateCandidate(candidate.navigation?.next?.id)}
              disabled={!candidate.navigation?.next}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#171717] text-white hover:bg-black disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] transition-all shadow-2xs active:scale-[0.98]"
              title={
                candidate.navigation?.next
                  ? `Next: ${candidate.navigation.next.name || candidate.navigation.next.rollNumber}`
                  : 'Last candidate reached'
              }
            >
              <span>Next Candidate</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#7AF1A7]" />
            </button>
          </div>
        </div>
      </div>

      {/* Transferred Lead Notice Bar */}
      {!isAdmin && !isCurrentLead && (
        <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-3 text-xs text-[#525252]">
          <div className="flex items-center gap-2.5">
            <ArrowRightLeft className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold text-[#171717]">Transferred Out (Read-Only Audit Mode)</p>
              <p className="text-[11px] text-[#737373]">
                This candidate was transferred to <strong>{candidate.currentDomain}</strong>. Ongoing evaluation and shortlisting decisions are managed by the destination lead.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-[#737373]">Domain:</span>
            <DomainBadge domain={candidate.currentDomain} />
          </div>
        </div>
      )}

      {/* Organiser Read-Only Notice Bar */}
      {isAdmin && (
        <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-3 text-xs text-[#525252]">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-[#171717] shrink-0" />
            <div>
              <p className="font-semibold text-[#171717]">Organiser Read-Only Mode</p>
              <p className="text-[11px] text-[#737373]">
                You can review all Google Form responses, scores, and lead evaluations. Shortlisting decisions are owned by domain team leads.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-[#737373]">Current Status:</span>
            <ShortlistBadge status={candidate.shortlistStatus} />
          </div>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#B8F7CF] text-xs text-[#166534] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#7AF1A7] shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Grid: Left side Google Form Responses, Right side Evaluations & Transfer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Columns: All 15 Google Form Responses Organized */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          {/* Section 1: Domain & Assignment Status Card */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-4 sm:p-6 shadow-ambient">
            <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider mb-4 pb-2 border-b border-[#F4F4F4] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#171717]" />
              Domain Assignment & Application State
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[11px] text-[#737373] font-medium block">
                  Original Applied Domain (Immutable)
                </span>
                <span className="font-semibold text-[#171717] mt-0.5 block">
                  {candidate.originalDomain}
                </span>
                <span className="text-[10px] text-[#A3A3A3]">Permanently preserved</span>
              </div>

              <div>
                <span className="text-[11px] text-[#737373] font-medium block">
                  Current Assigned Domain
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <DomainBadge domain={candidate.currentDomain} />
                  {isTransferred && (
                    <span className="text-[10px] bg-[#FFFBEB] text-amber-800 px-2 py-0.5 rounded-full border border-[#FDE68A] font-medium">
                      Transferred
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-[#737373] font-medium block">
                  Assigned Team Lead
                </span>
                <span className="font-semibold text-[#171717] mt-0.5 block">
                  {candidate.assignedLead?.name || (
                    <span className="text-[#A3A3A3] italic">Not Assigned</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Personal & Academic Details */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-ambient">
            <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider mb-4 pb-2 border-b border-[#F4F4F4] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#171717]" />
              1. Personal & Academic Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {candidate.name && (
                <div>
                  <span className="text-[11px] text-[#737373] font-medium block">Full Name</span>
                  <span className="font-semibold text-[#171717] mt-0.5 block">{candidate.name}</span>
                </div>
              )}

              <div>
                <span className="text-[11px] text-[#737373] font-medium block">Email Address</span>
                <a
                  href={`mailto:${candidate.email}`}
                  className="font-semibold text-[#171717] hover:underline flex items-center gap-1.5 mt-0.5"
                >
                  <Mail className="w-3.5 h-3.5 text-[#737373]" />
                  {candidate.email}
                </a>
              </div>

              <div>
                <span className="text-[11px] text-[#737373] font-medium block">Phone Number</span>
                <a
                  href={`tel:${candidate.phone}`}
                  className="font-semibold text-[#171717] flex items-center gap-1.5 mt-0.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#737373]" />
                  {candidate.phone || 'N/A'}
                </a>
              </div>

              <div>
                <span className="text-[11px] text-[#737373] font-medium block">Roll Number</span>
                <span className="font-semibold text-[#171717] mt-0.5 block">
                  {candidate.rollNumber}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#737373] font-medium block">Year of Study</span>
                <span className="font-semibold text-[#171717] mt-0.5 block">
                  Year {candidate.yearOfStudy}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#737373] font-medium block">Branch / Department</span>
                <span className="font-semibold text-[#171717] mt-0.5 block">
                  {candidate.branch}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#737373] font-medium block">Section</span>
                <span className="font-semibold text-[#171717] mt-0.5 block">
                  {candidate.section || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Domain Preference & Flexibility */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-ambient">
            <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider mb-4 pb-2 border-b border-[#F4F4F4] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#171717]" />
              2. Domain Preference & Flexibility
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[11px] text-[#737373] font-medium block">
                  Preferred Domain / Team
                </span>
                <span className="font-semibold text-[#171717] mt-0.5 block">
                  {candidate.preferredDomain}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#737373] font-medium block">
                  Open to Another Domain?
                </span>
                <span
                  className={`inline-block font-semibold px-2.5 py-0.5 rounded-full text-[11px] mt-0.5 border ${candidate.openToOtherDomain?.toLowerCase().includes('yes')
                    ? 'bg-[#F0FDF4] text-[#166534] border-[#B8F7CF]'
                    : 'bg-[#F4F4F4] text-[#525252] border-[#E5E5E5]'
                    }`}
                >
                  {candidate.openToOtherDomain || 'Yes'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Motivation & Interest */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-ambient space-y-4">
            <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider pb-2 border-b border-[#F4F4F4] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#171717]" />
              3. Motivation & Domain Interest
            </h3>

            <div>
              <span className="text-[11px] text-[#737373] font-semibold block mb-1.5">
                Why do you want to join GDGoC?
              </span>
              <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#F4F4F4] text-xs text-[#171717] leading-relaxed whitespace-pre-wrap">
                {candidate.whyJoin || <span className="text-[#A3A3A3] italic">No response provided</span>}
              </div>
            </div>

            <div>
              <span className="text-[11px] text-[#737373] font-semibold block mb-1.5">
                Why are you interested in this particular domain?
              </span>
              <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#F4F4F4] text-xs text-[#171717] leading-relaxed whitespace-pre-wrap">
                {candidate.whyDomain || <span className="text-[#A3A3A3] italic">No response provided</span>}
              </div>
            </div>
          </div>

          {/* Section 5: Experience & Contribution */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-ambient space-y-4">
            <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider pb-2 border-b border-[#F4F4F4] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#171717]" />
              4. Prior Experience & Community Contribution
            </h3>

            <div>
              <span className="text-[11px] text-[#737373] font-semibold block mb-1.5">
                Prior Experience or Knowledge
              </span>
              <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#F4F4F4] text-xs text-[#171717] leading-relaxed whitespace-pre-wrap">
                {candidate.priorExperience || (
                  <span className="text-[#A3A3A3] italic">No prior experience reported</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[11px] text-[#737373] font-semibold block mb-1.5">
                How can you contribute to GDGoC VJIT?
              </span>
              <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#F4F4F4] text-xs text-[#171717] leading-relaxed whitespace-pre-wrap">
                {candidate.contribution || (
                  <span className="text-[#A3A3A3] italic">No contribution proposal provided</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 6: External Profiles & Portfolios */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-ambient">
            <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider mb-4 pb-2 border-b border-[#F4F4F4] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#171717]" />
              5. Profiles & Portfolio Links
            </h3>

            <div className="flex flex-wrap gap-2.5">
              {candidate.linkedinUrl ? (
                <a
                  href={candidate.linkedinUrl.startsWith('http') ? candidate.linkedinUrl : `https://${candidate.linkedinUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-[#FAFAFA] hover:bg-[#F4F4F4] text-[#171717] border border-[#E5E5E5] transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5 text-[#0077b5]" />
                  LinkedIn Profile
                  <ExternalLink className="w-3 h-3 text-[#737373] ml-0.5" />
                </a>
              ) : (
                <span className="px-3.5 py-1.5 rounded-full text-xs bg-[#FAFAFA] text-[#A3A3A3] border border-[#E5E5E5]">
                  No LinkedIn provided
                </span>
              )}

              {candidate.githubUrl ? (
                <a
                  href={candidate.githubUrl.startsWith('http') ? candidate.githubUrl : `https://${candidate.githubUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-[#171717] text-white hover:bg-[#262626] transition-colors shadow-2xs"
                >
                  <Github className="w-3.5 h-3.5 text-[#7AF1A7]" />
                  GitHub Profile
                  <ExternalLink className="w-3 h-3 text-[#A3A3A3] ml-0.5" />
                </a>
              ) : (
                <span className="px-3.5 py-1.5 rounded-full text-xs bg-[#FAFAFA] text-[#A3A3A3] border border-[#E5E5E5]">
                  No GitHub provided
                </span>
              )}

              {candidate.portfolioUrl && (
                <a
                  href={candidate.portfolioUrl.startsWith('http') ? candidate.portfolioUrl : `https://${candidate.portfolioUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-[#F0FDF4] text-[#166534] hover:bg-[#E6F8ED] border border-[#B8F7CF] transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-[#7AF1A7]" />
                  Portfolio Website
                  <ExternalLink className="w-3 h-3 text-[#166534] ml-0.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Evaluations, Transfers & Action Forms */}
        <div className="space-y-6">
          {/* Add Interview Evaluation Form - Active Domain Team Leads Only */}
          {isCurrentLead && (
            <EvaluationForm
              candidateId={candidate._id}
              onEvaluationAdded={(newEval) => {
                setCandidate((prev) => ({
                  ...prev,
                  evaluations: [newEval, ...(prev.evaluations || [])]
                }));
                setActionSuccess('Interview evaluation successfully added and preserved.');
              }}
            />
          )}

          {/* Transfer Candidate Form - Active Domain Team Leads Only */}
          {isCurrentLead && (
            <TransferForm
              candidate={candidate}
              onTransferSuccess={(transferResult) => {
                fetchCandidate();
                setActionSuccess(
                  `Candidate successfully transferred to ${transferResult?.candidate?.currentDomain || 'new domain'}. Record saved to Transferred by Me.`
                );
              }}
            />
          )}

          {/* Historical Evaluations List */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 shadow-ambient">
            <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F4] mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#171717]" />
                <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                  Evaluation History ({candidate.evaluations?.length || 0})
                </h4>
              </div>
            </div>

            {!candidate.evaluations || candidate.evaluations.length === 0 ? (
              <p className="text-xs text-[#A3A3A3] italic py-2">
                No evaluations recorded yet for this candidate.
              </p>
            ) : (
              <div className="space-y-3">
                {candidate.evaluations.map((ev, i) => (
                  <div key={ev._id || i} className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F0FDF4] text-[#166534] border border-[#B8F7CF]">
                        Score: {ev.score} / 10
                      </span>
                      <span className="text-[10px] text-[#A3A3A3]">
                        {new Date(ev.timestamp || ev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-[#171717]">
                      Evaluator: {ev.leadName || 'Lead'} ({ev.evaluatorRole || 'lead'})
                    </p>
                    <p className="text-xs text-[#525252] bg-white p-3 rounded-xl border border-[#E5E5E5] whitespace-pre-wrap leading-relaxed">
                      {ev.remarks}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Transfers List */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 shadow-ambient">
            <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F4] mb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-[#171717]" />
                <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                  Transfer History ({candidate.transferHistory?.length || 0})
                </h4>
              </div>
            </div>

            {!candidate.transferHistory || candidate.transferHistory.length === 0 ? (
              <p className="text-xs text-[#A3A3A3] italic py-2">
                Candidate has not been transferred from original domain.
              </p>
            ) : (
              <div className="space-y-3">
                {candidate.transferHistory.map((t, idx) => (
                  <div key={t._id || idx} className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#171717]">
                        {t.previousDomain} → {t.destinationDomain}
                      </span>
                      <span className="text-[10px] text-[#737373]">
                        {new Date(t.timestamp || t.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#525252]">
                      <strong className="text-[#171717]">Reason: </strong> {t.transferReason}
                    </p>
                    {t.remarks && (
                      <p className="text-[11px] text-[#737373] italic">
                        <strong>Notes: </strong> {t.remarks}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
