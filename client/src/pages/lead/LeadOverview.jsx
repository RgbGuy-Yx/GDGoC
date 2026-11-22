import React, { useState, useEffect, useMemo } from 'react';
import { getAssignedCandidates } from '../../api/candidateApi';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { CandidateTable } from '../../components/candidates/CandidateTable';
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRightLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LeadOverview = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLeadData = async () => {
      setLoading(true);
      try {
        const res = await getAssignedCandidates({ limit: 500 });
        if (res.success) {
          setCandidates(res.data || []);
        } else {
          setError('Failed to load assigned candidates.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load assigned candidates.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeadData();
  }, []);

  // Called by CandidateTable after a successful inline shortlist/reject action,
  // so stats and progress update immediately without a full refetch.
  const handleStatusChange = (candidateId, newStatus) => {
    setCandidates((prev) =>
      prev.map((c) => (c._id === candidateId ? { ...c, shortlistStatus: newStatus } : c))
    );
  };

  // Compute metrics
  const total = candidates.length;
  const shortlisted = candidates.filter((c) => c.shortlistStatus === 'SHORTLISTED').length;
  const waitlisted = candidates.filter((c) => c.shortlistStatus === 'WAITLISTED').length;
  const pending = candidates.filter((c) => c.shortlistStatus === 'PENDING' || c.shortlistStatus === 'IN_REVIEW').length;
  const notShortlisted = candidates.filter((c) => c.shortlistStatus === 'REJECTED').length;
  const transferredIn = candidates.filter((c) => c.originalDomain !== c.currentDomain).length;

  // Reviewed = any decision has been made (shortlisted, waitlisted, or rejected)
  const reviewed = shortlisted + waitlisted + notShortlisted;
  const reviewedPct = total ? Math.round((reviewed / total) * 100) : 0;

  // "Needs attention" = anything not yet in a final shortlisted state
  const needsAttention = pending + notShortlisted;

  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return candidates;
    const q = searchQuery.trim().toLowerCase();
    return candidates.filter((c) =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.currentDomain || '').toLowerCase().includes(q) ||
      (c.candidateId || '').toLowerCase().includes(q)
    );
  }, [candidates, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium px-3 py-0.5 rounded-full bg-white text-[#171717] border border-[#E5E5E5] shadow-2xs">
              Domain: {user?.domains?.join(', ') || 'Assigned Domains'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#171717] tracking-tight">
            Welcome, {user?.name || 'Team Lead'}
          </h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Evaluate, shortlist, and manage candidates applying for your assigned domain
          </p>
        </div>
        <Link
          to="/lead/candidates"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-2xs transition-all self-start sm:self-auto active:scale-[0.98]"
        >
          View My Candidates
          <ChevronRight className="w-3.5 h-3.5 text-white" />
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Review Progress */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 shadow-ambient">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-[#171717]">Review Progress</p>
          <p className="text-xs text-[#737373]">
            <span className="font-semibold text-[#171717]">{reviewed}</span> of {total} reviewed ({reviewedPct}%)
          </p>
        </div>
        <div className="w-full h-2 rounded-full bg-[#F4F4F4] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#34A853] transition-all duration-500"
            style={{ width: `${reviewedPct}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="Assigned Candidates"
          value={total}
          subtitle={`In ${user?.domains?.[0] || 'domain'}`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Shortlisted"
          value={shortlisted}
          subtitle={`${total ? Math.round((shortlisted / total) * 100) : 0}% interview pass`}
          icon={CheckCircle2}
          color="mint"
        />
        <StatCard
          title="Pending / Review"
          value={pending}
          subtitle="Needs evaluation"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Not Shortlisted"
          value={notShortlisted}
          subtitle="Rejected candidates"
          icon={XCircle}
          color="red"
        />
        <StatCard
          title="Transferred In"
          value={transferredIn}
          subtitle="From another domain"
          icon={ArrowRightLeft}
          color="purple"
        />
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          to="/lead/shortlisted"
          className="p-5 rounded-2xl bg-white border border-[#E5E5E5] hover:border-[#171717] shadow-ambient transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-semibold text-[#171717]">
              Shortlisted Candidates ({shortlisted})
            </p>
            <p className="text-[11px] text-[#737373] mt-0.5">Candidates marked for final admission review</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-[#171717] group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/lead/not-shortlisted"
          className="p-5 rounded-2xl bg-white border border-[#E5E5E5] hover:border-[#171717] shadow-ambient transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-semibold text-[#171717]">
              Needs Attention ({needsAttention})
            </p>
            <p className="text-[11px] text-[#737373] mt-0.5">Pending review or previously rejected candidates</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-[#171717] group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/lead/transferred-to-me"
          className="p-5 rounded-2xl bg-white border border-[#E5E5E5] hover:border-[#171717] shadow-ambient transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-semibold text-[#171717]">
              Transferred to Me ({transferredIn})
            </p>
            <p className="text-[11px] text-[#737373] mt-0.5">Candidates routed from another team lead</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-[#171717] group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* Candidate Table Preview */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-sm font-semibold text-[#171717] tracking-tight">Recent Domain Candidates</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
              <label htmlFor="lead-overview-search" className="sr-only">Search candidates</label>
              <input
                id="lead-overview-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, domain, ID..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-full border border-[#E5E5E5] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8] w-48 sm:w-56 transition-all"
              />
            </div>
            <Link to="/lead/candidates" className="text-xs font-medium text-[#1a73e8] hover:underline whitespace-nowrap">
              View All ({total}) &rarr;
            </Link>
          </div>
        </div>
        <CandidateTable
          candidates={filteredCandidates.slice(0, 5)}
          loading={loading}
          baseDetailPath="/lead/candidates"
          onStatusChange={handleStatusChange}
        />
        {!loading && searchQuery.trim() && filteredCandidates.length === 0 && (
          <p className="text-xs text-[#737373] text-center py-4">No candidates match "{searchQuery}"</p>
        )}
      </div>
    </div>
  );
};
