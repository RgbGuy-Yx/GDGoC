import React, { useState, useEffect } from 'react';
import { getAssignedCandidates } from '../../api/candidateApi';
import { CandidateTable } from '../../components/candidates/CandidateTable';
import { Search, RefreshCw, X, ArrowUpDown } from 'lucide-react';

export const LeadCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [shortlistStatus, setShortlistStatus] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [sortBy, setSortBy] = useState('year'); // default interview priority: 1st Year first
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCandidates = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit: 15,
        search: search.trim() || undefined,
        shortlistStatus: shortlistStatus || undefined,
        yearOfStudy: yearOfStudy || undefined,
        sortBy: sortBy || undefined
      };

      const res = await getAssignedCandidates(params);
      if (res.success) {
        setCandidates(res.data || []);
        if (res.meta?.pagination) {
          setPagination(res.meta.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch assigned candidates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [currentPage, shortlistStatus, yearOfStudy, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCandidates();
  };

  const handleStatusChange = (candidateId, newStatus) => {
    setCandidates((prev) =>
      prev.map((c) => (c._id === candidateId ? { ...c, shortlistStatus: newStatus } : c))
    );
  };

  const handleReset = () => {
    setSearch('');
    setShortlistStatus('');
    setYearOfStudy('');
    setSortBy('year');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Assigned Candidates</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Candidates assigned to your domain — separate and prioritize by academic year for scheduled interviews
          </p>
        </div>
        <button
          onClick={fetchCandidates}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-4 shadow-ambient space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A3A3A3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Roll Number, Email, or Branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#171717] text-[#171717] bg-[#FAFAFA] placeholder-[#A3A3A3]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold rounded-full bg-[#171717] text-white hover:bg-[#262626] transition-all shadow-2xs active:scale-[0.98]"
          >
            Search
          </button>
        </form>

        <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {/* Minimal Segmented Year Switcher */}
            <div className="inline-flex items-center bg-[#F4F4F4] p-0.5 rounded-full border border-[#E5E5E5] text-xs max-w-full overflow-x-auto no-scrollbar shrink-0">
              <button
                type="button"
                onClick={() => { setYearOfStudy(''); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
                  !yearOfStudy
                    ? 'bg-white text-[#171717] font-semibold shadow-2xs'
                    : 'text-[#737373] hover:text-[#171717]'
                }`}
              >
                All Years
              </button>
              <button
                type="button"
                onClick={() => { setYearOfStudy('1st Year'); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
                  yearOfStudy === '1st Year'
                    ? 'bg-white text-blue-700 font-semibold shadow-2xs'
                    : 'text-[#737373] hover:text-[#171717]'
                }`}
              >
                1st Year
              </button>
              <button
                type="button"
                onClick={() => { setYearOfStudy('2nd Year'); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
                  yearOfStudy === '2nd Year'
                    ? 'bg-white text-purple-700 font-semibold shadow-2xs'
                    : 'text-[#737373] hover:text-[#171717]'
                }`}
              >
                2nd Year
              </button>
              <button
                type="button"
                onClick={() => { setYearOfStudy('3rd Year'); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
                  yearOfStudy === '3rd Year'
                    ? 'bg-white text-amber-700 font-semibold shadow-2xs'
                    : 'text-[#737373] hover:text-[#171717]'
                }`}
              >
                3rd Year
              </button>
            </div>

            {/* Shortlist Status Filter */}
            <select
              value={shortlistStatus}
              onChange={(e) => {
                setShortlistStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-1.5 text-xs border border-[#E5E5E5] rounded-full focus:outline-none focus:ring-1 focus:ring-[#171717] bg-[#FAFAFA] text-[#171717]"
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
            {(search || shortlistStatus || yearOfStudy) && (
              <button
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
              disabled={pagination.page <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-4 py-1.5 rounded-full border border-[#E5E5E5] bg-white hover:bg-[#F4F4F4] disabled:opacity-40 transition-colors font-medium text-[#171717]"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
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
