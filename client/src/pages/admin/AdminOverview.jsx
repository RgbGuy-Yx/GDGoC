import React, { useState, useEffect } from 'react';
import { getAllCandidates } from '../../api/candidateApi';
import { StatCard } from '../../components/common/StatCard';
import { CandidateTable } from '../../components/candidates/CandidateTable';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Layers,
  ArrowRightLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminOverview = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getAllCandidates({ limit: 1000 });
        if (res.success) {
          setCandidates(res.data || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load recruitment metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute Metrics
  const totalCount = candidates.length;
  const shortlistedCount = candidates.filter((c) => c.shortlistStatus === 'SHORTLISTED').length;
  const notShortlistedCount = candidates.filter((c) => c.shortlistStatus === 'REJECTED').length;
  const pendingCount = candidates.filter(
    (c) => c.shortlistStatus === 'PENDING' || c.shortlistStatus === 'IN_REVIEW'
  ).length;

  const finalSelectedCount = candidates.filter((c) => c.finalSelectionStatus === 'SELECTED').length;
  const finalRejectedCount = candidates.filter((c) => c.finalSelectionStatus === 'REJECTED').length;
  const finalWaitlistedCount = candidates.filter((c) => c.finalSelectionStatus === 'WAITLISTED').length;

  // Domain Breakdown
  const domainCounts = candidates.reduce((acc, c) => {
    const d = c.currentDomain || 'Unassigned';
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  const domainList = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#171717] tracking-tight">Organisers Overview</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Real-time candidate metrics across all domains and team lead interview stages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/import"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#171717] hover:bg-[#262626] text-white text-xs font-semibold shadow-2xs active:scale-[0.98] transition-all"
          >
            Import Spreadsheet
          </Link>
          <Link
            to="/admin/candidates"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#E5E5E5] text-[#171717] hover:bg-[#F4F4F4] text-xs font-medium shadow-2xs transition-all"
          >
            Directory
            <ChevronRight className="w-3.5 h-3.5 text-[#737373]" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Primary Statistic Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Candidates"
          value={totalCount}
          subtitle="Form submissions"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Shortlisted"
          value={shortlistedCount}
          subtitle={`${totalCount ? Math.round((shortlistedCount / totalCount) * 100) : 0}% pass rate`}
          icon={CheckCircle2}
          color="mint"
        />
        <StatCard
          title="Pending / Review"
          value={pendingCount}
          subtitle="Awaiting lead interview"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Not Shortlisted"
          value={notShortlistedCount}
          subtitle="Screening rejected"
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Final Selection Breakdown */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-ambient">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-full bg-[#F0FDF4] border border-[#B8F7CF] text-[#166534]">
              <Award className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-[#171717] tracking-tight">Final Decision Status</h3>
          </div>
          <Link to="/admin/final-results" className="text-xs font-medium text-[#171717] hover:underline flex items-center gap-1">
            View Shortlisted Roster →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#B8F7CF]">
            <p className="text-xs text-[#166534] font-medium">Selected for GDGoC</p>
            <p className="text-2xl font-bold text-[#171717] mt-1 tracking-tight">{finalSelectedCount}</p>
            <p className="text-[11px] text-[#166534] mt-0.5">Confirmed membership offers</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A]">
            <p className="text-xs text-[#92400E] font-medium">Waitlisted</p>
            <p className="text-2xl font-bold text-[#171717] mt-1 tracking-tight">{finalWaitlistedCount}</p>
            <p className="text-[11px] text-[#92400E] mt-0.5">Secondary candidate pool</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E5E5]">
            <p className="text-xs text-[#737373] font-medium">Final Rejected</p>
            <p className="text-2xl font-bold text-[#171717] mt-1 tracking-tight">{finalRejectedCount}</p>
            <p className="text-[11px] text-[#737373] mt-0.5">Declined post-interview</p>
          </div>
        </div>
      </div>

      {/* Domain-wise Distribution */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-ambient">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-full bg-[#F4F4F4] text-[#171717]">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-[#171717] tracking-tight">Candidates by Domain</h3>
          </div>
          <Link to="/admin/domains" className="text-xs font-medium text-[#171717] hover:underline">
            Explore All Domains →
          </Link>
        </div>

        {domainList.length === 0 ? (
          <p className="text-xs text-[#737373] py-3">No domain data available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {domainList.map(([domain, count]) => {
              const pct = totalCount ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div
                  key={domain}
                  className="p-3.5 rounded-2xl border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-white hover:shadow-2xs transition-all"
                >
                  <p className="text-xs font-semibold text-[#171717] truncate" title={domain}>
                    {domain}
                  </p>
                  <p className="text-lg font-bold text-[#171717] mt-1 tracking-tight">{count}</p>
                  <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="bg-[#7AF1A7] h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#737373] mt-1.5">{pct}% of total</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Candidates List Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#171717] tracking-tight">Recent Candidate Applications</h3>
          <Link to="/admin/candidates" className="text-xs font-medium text-[#171717] hover:underline">
            View All ({totalCount}) →
          </Link>
        </div>
        <CandidateTable
          candidates={candidates.slice(0, 5)}
          loading={loading}
          baseDetailPath="/admin/candidates"
        />
      </div>
    </div>
  );
};
