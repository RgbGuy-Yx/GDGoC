import React, { useState, useEffect } from 'react';
import { getAllCandidates } from '../../api/candidateApi';
import { getAllLeads } from '../../api/leadApi';
import { useDomains } from '../../hooks/useDomains';
import { CandidateTable } from '../../components/candidates/CandidateTable';
import { Search, Filter, RefreshCw, X, ArrowUpDown } from 'lucide-react';

export const AdminCandidates = () => {
  const { domains } = useDomains();
  const [candidates, setCandidates] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [sortBy, setSortBy] = useState('year'); // default interview priority
  const [leadId, setLeadId] = useState('');
  const [shortlistStatus, setShortlistStatus] = useState('');
  const [finalStatus, setFinalStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch leads for filter dropdown
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await getAllLeads();
        if (res.success) setLeads(res.data || []);
      } catch (err) {
        console.error('Failed to load leads:', err);
      }
    };
    fetchLeads();
  }, []);

  // Fetch candidates on filter/page change
  const fetchCandidates = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit: 15,
        search: search.trim() || undefined,
        domain: domain || undefined,
        yearOfStudy: yearOfStudy || undefined,
        sortBy: sortBy || undefined,
        shortlistStatus: shortlistStatus || undefined,
        finalSelectionStatus: finalStatus || undefined
      };

      const res = await getAllCandidates(params);
      if (res.success) {
        let fetchedCandidates = res.data || [];
        // Optional client-side lead filter if needed
        if (leadId) {
          fetchedCandidates = fetchedCandidates.filter(
            (c) => c.assignedLead?._id === leadId || c.assignedLead === leadId
          );
        }
        setCandidates(fetchedCandidates);
        if (res.meta?.pagination) {
          setPagination(res.meta.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load candidates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [currentPage, domain, yearOfStudy, sortBy, shortlistStatus, finalStatus, leadId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCandidates();
  };

  const handleResetFilters = () => {
    setSearch('');
    setDomain('');
    setYearOfStudy('');
    setSortBy('year');
    setLeadId('');
    setShortlistStatus('');
    setFinalStatus('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#171717] tracking-tight">All Candidates Directory</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Complete directory of candidate applications and Google Form responses (Organisers View)
          </p>
        </div>
        <button
          onClick={fetchCandidates}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full bg-white border border-[#E5E5E5] text-[#171717] hover:bg-[#F4F4F4] transition-all shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#737373] ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
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
              placeholder="Search by Roll Number, Email, Candidate ID, or Branch..."
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

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Minimal Segmented Year Switcher */}
          <div className="inline-flex items-center bg-[#F4F4F4] p-0.5 rounded-full border border-[#E5E5E5] text-xs max-w-full overflow-x-auto no-scrollbar shrink-0">
            <button
              type="button"
              onClick={() => { setYearOfStudy(''); setCurrentPage(1); }}
              className={`px-3.5 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
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
              className={`px-3.5 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
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
              className={`px-3.5 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
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
              className={`px-3.5 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
                yearOfStudy === '3rd Year'
                  ? 'bg-white text-amber-700 font-semibold shadow-2xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              3rd Year
            </button>
          </div>

          {/* Secondary Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Domain Filter */}
            <select
              value={domain}
              onChange={(e) => { setDomain(e.target.value); setCurrentPage(1); }}
              className="px-3.5 py-1.5 text-xs border border-[#E5E5E5] rounded-full focus:outline-none focus:ring-1 focus:ring-[#171717] bg-[#FAFAFA] text-[#171717]"
            >
              <option value="">All Domains</option>
              {domains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Lead Filter */}
            <select
              value={leadId}
              onChange={(e) => { setLeadId(e.target.value); setCurrentPage(1); }}
              className="px-3.5 py-1.5 text-xs border border-[#E5E5E5] rounded-full focus:outline-none focus:ring-1 focus:ring-[#171717] bg-[#FAFAFA] text-[#171717]"
            >
              <option value="">All Leads</option>
              {leads.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name}
                </option>
              ))}
            </select>

            {/* Shortlist Filter */}
            <select
              value={shortlistStatus}
              onChange={(e) => { setShortlistStatus(e.target.value); setCurrentPage(1); }}
              className="px-3.5 py-1.5 text-xs border border-[#E5E5E5] rounded-full focus:outline-none focus:ring-1 focus:ring-[#171717] bg-[#FAFAFA] text-[#171717]"
            >
              <option value="">All Shortlist</option>
              <option value="PENDING">Pending</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="REJECTED">Not Shortlisted</option>
            </select>

            {/* Final Status Filter */}
            <select
              value={finalStatus}
              onChange={(e) => { setFinalStatus(e.target.value); setCurrentPage(1); }}
              className="px-3.5 py-1.5 text-xs border border-[#E5E5E5] rounded-full focus:outline-none focus:ring-1 focus:ring-[#171717] bg-[#FAFAFA] text-[#171717]"
            >
              <option value="">All Final</option>
              <option value="PENDING">Pending</option>
              <option value="SELECTED">Selected</option>
              <option value="WAITLISTED">Waitlisted</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="px-3.5 py-1.5 text-xs border border-[#E5E5E5] rounded-full focus:outline-none focus:ring-1 focus:ring-[#171717] bg-[#FAFAFA] text-[#171717]"
            >
              <option value="year">1st → 2nd → 3rd Year</option>
              <option value="newest">Newest First</option>
            </select>

            {/* Clear Filters */}
            {(domain || leadId || shortlistStatus || finalStatus || search || yearOfStudy) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#525252] hover:text-rose-600 hover:bg-rose-50 border border-[#E5E5E5] rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Table */}
      <CandidateTable
        candidates={candidates}
        loading={loading}
        baseDetailPath="/admin/candidates"
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
