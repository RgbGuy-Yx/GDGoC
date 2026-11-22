import React, { useState, useEffect } from 'react';
import { getAssignedCandidates } from '../../api/candidateApi';
import { CandidateTable } from '../../components/candidates/CandidateTable';
import { Search, RefreshCw, X } from 'lucide-react';

const PAGE_SIZE = 15;
// Interview priority: 1st Year first (unchanged backend behaviour)
const SORT_BY = 'year';

const YEAR_OPTIONS = [
  { value: '', label: 'All Years', activeText: 'text-[#171717]' },
  { value: '1st Year', label: '1st Year', activeText: 'text-blue-700' },
  { value: '2nd Year', label: '2nd Year', activeText: 'text-purple-700' },
  { value: '3rd Year', label: '3rd Year', activeText: 'text-amber-700' }
];

export const LeadCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [shortlistStatus, setShortlistStatus] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getAssignedCandidates({
          page: currentPage,
          limit: PAGE_SIZE,
          search: appliedSearch || undefined,
          shortlistStatus: shortlistStatus || undefined,
          yearOfStudy: yearOfStudy || undefined,
          sortBy: SORT_BY
        });
        if (cancelled) return;
        if (res.success) {
          setCandidates(res.data || []);
          if (res.meta?.pagination) {
            setPagination(res.meta.pagination);
          }
        } else {
          setError('Failed to fetch assigned candidates.');
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to fetch assigned candidates.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [currentPage, shortlistStatus, yearOfStudy, appliedSearch, refreshKey]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedSearch(search.trim());
    setCurrentPage(1);
  };

  const handleStatusChange = (candidateId, newStatus) => {
    setCandidates((prev) =>
      prev.map((c) => (c._id === candidateId ? { ...c, shortlistStatus: newStatus } : c))
    );
  };

  const handleReset = () => {
    setSearch('');
    setAppliedSearch('');
    setShortlistStatus('');
    setYearOfStudy('');
    setCurrentPage(1);
  };

  const hasFilters = Boolean(search || appliedSearch || shortlistStatus || yearOfStudy);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#171717] tracking-tight">My Candidates</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Candidates assigned to your domain. Filter by year to plan interviews.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-white border border-[#E5E5E5] text-[#171717] hover:bg-[#F4F4F4] transition-colors shadow-2xs self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-4 shadow-ambient space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A3A3A3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <label htmlFor="lead-candidates-search" className="sr-only">Search candidates</label>
            <input
              id="lead-candidates-search"
              type="text"
              placeholder="Search by roll number, email, or branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-[#E5E5E5] rounded-full focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8] text-[#171717] bg-[#FAFAFA] placeholder-[#A3A3A3]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold rounded-full bg-[#1a73e8] text-white hover:bg-[#1557b0] transition-all shadow-2xs active:scale-[0.98]"
          >
            Search
          </button>
        </form>

        <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {/* Year Switcher */}
            <div className="inline-flex items-center bg-[#F4F4F4] p-0.5 rounded-full border border-[#E5E5E5] text-xs max-w-full overflow-x-auto no-scrollbar shrink-0">
              {YEAR_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    setYearOfStudy(opt.value);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
                    yearOfStudy === opt.value
                      ? `bg-white ${opt.activeText} font-semibold shadow-2xs`
                      : 'text-[#737373] hover:text-[#171717]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Shortlist Status Filter */}
            <label htmlFor="lead-candidates-status" className="sr-only">Filter by status</label>
            <select
              id="lead-candidates-status"
              value={shortlistStatus}
              onChange={(e) => {
                setShortlistStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-1.5 text-xs border border-[#E5E5E5] rounded-full focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30 bg-[#FAFAFA] text-[#171717]"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="WAITLISTED">Waitlisted</option>
              <option value="REJECTED">Not Shortlisted</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {hasFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[#525252] hover:text-rose-600 hover:bg-rose-50 border border-[#E5E5E5] rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      <CandidateTable
        candidates={candidates}
        loading={loading}
        baseDetailPath="/lead/candidates"
        onStatusChange={handleStatusChange}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-xs text-[#737373]">
          <span>
            Page <strong className="text-[#171717]">{pagination.page}</strong> of{' '}
            <strong className="text-[#171717]">{pagination.totalPages}</strong> ({pagination.total} total)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-4 py-1.5 rounded-full border border-[#E5E5E5] bg-white hover:bg-[#F4F4F4] disabled:opacity-40 transition-colors font-medium text-[#171717]"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-1.5 rounded-full border border-[#E5E5E5] bg-white hover:bg-[#F4F4F4] disabled:opacity-40 transition-colors font-medium text-[#171717]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
