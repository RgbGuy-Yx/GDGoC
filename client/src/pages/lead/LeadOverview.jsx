import React, { useState, useEffect } from 'react';
import { getAssignedCandidates } from '../../api/candidateApi';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { CandidateTable } from '../../components/candidates/CandidateTable';
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Layers,
  ArrowRightLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LeadOverview = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeadData = async () => {
      setLoading(true);
      try {
        const res = await getAssignedCandidates({ limit: 500 });
        if (res.success) {
          setCandidates(res.data || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load assigned candidates.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeadData();
  }, []);

  // Compute metrics
  const total = candidates.length;
  const shortlisted = candidates.filter((c) => c.shortlistStatus === 'SHORTLISTED').length;
  const pending = candidates.filter((c) => c.shortlistStatus === 'PENDING' || c.shortlistStatus === 'IN_REVIEW').length;
  const notShortlisted = candidates.filter((c) => c.shortlistStatus === 'REJECTED').length;
  const transferredIn = candidates.filter((c) => c.originalDomain !== c.currentDomain).length;

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

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              Unreviewed / In Progress ({pending})
            </p>
            <p className="text-[11px] text-[#737373] mt-0.5">Candidates pending your interview evaluation</p>
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
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#171717] tracking-tight">Recent Domain Candidates</h3>
          <Link to="/lead/candidates" className="text-xs font-medium text-[#171717] hover:underline">
            View All ({total}) →
          </Link>
        </div>
        <CandidateTable
          candidates={candidates.slice(0, 5)}
          loading={loading}
          baseDetailPath="/lead/candidates"
        />
      </div>
    </div>
  );
};
