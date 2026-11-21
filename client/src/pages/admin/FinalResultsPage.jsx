import React, { useState, useEffect } from 'react';
import { getAllCandidates } from '../../api/candidateApi';
import { useDomains } from '../../hooks/useDomains';
import { ShortlistBadge, DomainBadge } from '../../components/common/Badge';
import { Link } from 'react-router-dom';
import { CheckCircle2, Search, UserCheck, Layers, ChevronRight, User, ExternalLink } from 'lucide-react';

export const FinalResultsPage = () => {
  const { domains } = useDomains();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');

  useEffect(() => {
    const fetchShortlisted = async () => {
      setLoading(true);
      try {
        const res = await getAllCandidates({ limit: 1000 });
        if (res.success) {
          // Keep all candidates to compute stats and filter shortlisted
          setCandidates(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load candidates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShortlisted();
  }, []);

  // Filter only shortlisted candidates
  const allShortlisted = candidates.filter((c) => c.shortlistStatus === 'SHORTLISTED');

  // Filter by selected domain, year, and search query
  const filteredCandidates = allShortlisted.filter((c) => {
    if (selectedDomain !== 'ALL' && c.currentDomain !== selectedDomain) {
      return false;
    }
    if (selectedYear !== 'ALL') {
      if (/^1/i.test(selectedYear) && !/^1/i.test(c.yearOfStudy)) return false;
      if (/^2/i.test(selectedYear) && !/^2/i.test(c.yearOfStudy)) return false;
      if (/^3/i.test(selectedYear) && !/^3/i.test(c.yearOfStudy)) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchRoll = c.rollNumber?.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      const matchId = c.candidateId?.toLowerCase().includes(q);
      if (!matchName && !matchRoll && !matchEmail && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#171717] tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#7AF1A7]" />
            Candidates Shortlisted by Team Leads
          </h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Organisers portal view of all applicants endorsed and selected by domain team leads
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setSelectedDomain('ALL')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            selectedDomain === 'ALL'
              ? 'bg-[#171717] text-white border-[#171717] shadow-ambient'
              : 'bg-white border-[#E5E5E5] hover:border-slate-300 shadow-ambient'
          }`}
        >
          <span className={`text-[11px] font-medium block truncate ${selectedDomain === 'ALL' ? 'text-white/70' : 'text-[#737373]'}`}>
            Total Shortlisted
          </span>
          <p className="text-2xl font-bold mt-1 tracking-tight">{allShortlisted.length}</p>
        </div>

        {domains.map((dom) => {
          const count = allShortlisted.filter((c) => c.currentDomain === dom).length;
          const isSelected = selectedDomain === dom;
          return (
            <div
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                isSelected
                  ? 'bg-[#F0FDF4] border-[#B8F7CF] text-[#166534] shadow-ambient'
                  : 'bg-white border-[#E5E5E5] hover:border-slate-300 shadow-ambient'
              }`}
            >
              <span className={`text-[11px] font-medium block truncate ${isSelected ? 'text-[#166534]' : 'text-[#737373]'}`} title={dom}>
                {dom.replace(/\s*\(Team.*?\)/i, '')}
              </span>
              <p className={`text-2xl font-bold mt-1 tracking-tight ${isSelected ? 'text-[#166534]' : 'text-[#171717]'}`}>
                {count}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search & Team Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-4 shadow-ambient space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#A3A3A3] absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by candidate name, roll number, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#171717] text-[#171717] bg-[#FAFAFA] placeholder-[#A3A3A3]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Minimal Segmented Year Switcher */}
            <div className="inline-flex items-center bg-[#F4F4F4] p-0.5 rounded-full border border-[#E5E5E5] text-xs max-w-full overflow-x-auto no-scrollbar shrink-0">
              <button
                type="button"
                onClick={() => setSelectedYear('ALL')}
                className={`px-3.5 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
                  selectedYear === 'ALL'
                    ? 'bg-white text-[#171717] font-semibold shadow-2xs'
                    : 'text-[#737373] hover:text-[#171717]'
                }`}
              >
                All Years
              </button>
              <button
                type="button"
                onClick={() => setSelectedYear('1st Year')}
                className={`px-3.5 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
                  selectedYear === '1st Year'
                    ? 'bg-white text-blue-700 font-semibold shadow-2xs'
                    : 'text-[#737373] hover:text-[#171717]'
                }`}
              >
                1st Year
              </button>
              <button
                type="button"
                onClick={() => setSelectedYear('2nd Year')}
                className={`px-3.5 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
                  selectedYear === '2nd Year'
                    ? 'bg-white text-purple-700 font-semibold shadow-2xs'
                    : 'text-[#737373] hover:text-[#171717]'
                }`}
              >
                2nd Year
              </button>
              <button
                type="button"
                onClick={() => setSelectedYear('3rd Year')}
                className={`px-3.5 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
                  selectedYear === '3rd Year'
                    ? 'bg-white text-amber-700 font-semibold shadow-2xs'
                    : 'text-[#737373] hover:text-[#171717]'
                }`}
              >
                3rd Year
              </button>
            </div>
          </div>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#F4F4F4]">
          <button
            onClick={() => setSelectedDomain('ALL')}
            className={`px-3.5 py-1 text-xs rounded-full font-medium transition-all ${
              selectedDomain === 'ALL'
                ? 'bg-[#171717] text-white shadow-2xs font-semibold'
                : 'bg-[#F4F4F4] text-[#525252] hover:bg-[#E5E5E5]'
            }`}
          >
            All Teams ({allShortlisted.length})
          </button>
          {domains.map((dom) => {
            const count = allShortlisted.filter((c) => c.currentDomain === dom).length;
            const isSelected = selectedDomain === dom;
            return (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={`px-3.5 py-1 text-xs rounded-full font-medium transition-all ${
                  isSelected
                    ? 'bg-[#171717] text-white shadow-2xs font-semibold'
                    : 'bg-[#F4F4F4] text-[#525252] hover:bg-[#E5E5E5]'
                }`}
              >
                {dom} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Table of Shortlisted Candidates */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Fetching shortlisted candidates...</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <User className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800">No shortlisted candidates found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {allShortlisted.length === 0
              ? 'Team leads have not marked any candidates as shortlisted yet. Shortlisted candidates will appear here as interviews conclude.'
              : 'No shortlisted candidates match your current search or domain filter.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Year & Branch</th>
                  <th className="py-3 px-4">Shortlisted Team</th>
                  <th className="py-3 px-4">Assigned Team Lead</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4 text-right">Responses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Identification */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {c.name || c.rollNumber}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono tracking-tight block">
                        {c.rollNumber} · {c.candidateId}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4">
                      <span className="text-slate-800 block truncate max-w-[160px] font-medium" title={c.email}>
                        {c.email}
                      </span>
                      <span className="text-slate-500 text-[11px] block">{c.phone || 'N/A'}</span>
                    </td>

                    {/* Academic */}
                    <td className="py-3 px-4">
                      <span className="text-slate-800 font-medium block">
                        Year {c.yearOfStudy} · {c.branch}
                      </span>
                      {c.section && <span className="text-slate-500 text-[10px] block">Sec {c.section}</span>}
                    </td>

                    {/* Shortlisted Team */}
                    <td className="py-3 px-4">
                      <DomainBadge domain={c.currentDomain} />
                    </td>

                    {/* Assigned Lead */}
                    <td className="py-3 px-4">
                      {c.assignedLead ? (
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{c.assignedLead.name || c.assignedLead}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                      )}
                    </td>

                    {/* Shortlist Badge */}
                    <td className="py-3 px-4">
                      <ShortlistBadge status={c.shortlistStatus} />
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/admin/candidates/${c._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <span>View Form</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
