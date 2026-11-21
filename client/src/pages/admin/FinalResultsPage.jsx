import React, { useState, useEffect } from 'react';
import { getAllCandidates, updateFinalSelectionStatus } from '../../api/candidateApi';
import { useDomains } from '../../hooks/useDomains';
import { ShortlistBadge, FinalStatusBadge, DomainBadge, YearBadge } from '../../components/common/Badge';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Search,
  UserCheck,
  ChevronRight,
  User,
  ExternalLink,
  Copy,
  Check,
  Download,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Award,
  Users
} from 'lucide-react';

export const FinalResultsPage = () => {
  const { domains } = useDomains();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [finalStatusFilter, setFinalStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState('');

  const fetchCandidates = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllCandidates({ limit: 1000 });
      if (res.success) {
        setCandidates(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load candidates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Filter only candidates endorsed/shortlisted by Team Leads
  const allShortlisted = candidates.filter((c) => c.shortlistStatus === 'SHORTLISTED');

  // Stats across all shortlisted candidates
  const totalSelected = allShortlisted.filter((c) => c.finalSelectionStatus === 'SELECTED').length;
  const totalWaitlisted = allShortlisted.filter((c) => c.finalSelectionStatus === 'WAITLISTED').length;
  const totalRejected = allShortlisted.filter((c) => c.finalSelectionStatus === 'REJECTED').length;
  const totalPending = allShortlisted.filter(
    (c) => !c.finalSelectionStatus || c.finalSelectionStatus === 'PENDING'
  ).length;

  // Filter candidates by Domain, Year, Final Selection Status, and Search
  const filteredCandidates = allShortlisted.filter((c) => {
    // Final status filter
    if (finalStatusFilter === 'SELECTED' && c.finalSelectionStatus !== 'SELECTED') return false;
    if (finalStatusFilter === 'WAITLISTED' && c.finalSelectionStatus !== 'WAITLISTED') return false;
    if (finalStatusFilter === 'REJECTED' && c.finalSelectionStatus !== 'REJECTED') return false;
    if (
      finalStatusFilter === 'PENDING' &&
      c.finalSelectionStatus &&
      c.finalSelectionStatus !== 'PENDING'
    )
      return false;

    // Domain filter
    if (selectedDomain !== 'ALL' && c.currentDomain !== selectedDomain) {
      return false;
    }

    // Year filter
    if (selectedYear !== 'ALL') {
      if (/^1/i.test(selectedYear) && !/^1/i.test(c.yearOfStudy)) return false;
      if (/^2/i.test(selectedYear) && !/^2/i.test(c.yearOfStudy)) return false;
      if (/^3/i.test(selectedYear) && !/^3/i.test(c.yearOfStudy)) return false;
    }

    // Search query
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

  // Handler for quick row status change
  const handleStatusChange = async (candidateId, newStatus) => {
    setUpdatingId(candidateId);
    try {
      const res = await updateFinalSelectionStatus(candidateId, newStatus);
      if (res.success) {
        setCandidates((prev) =>
          prev.map((c) =>
            c._id === candidateId ? { ...c, finalSelectionStatus: newStatus } : c
          )
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update candidate status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Copy Selected Members Roster to Clipboard
  const handleCopyRoster = () => {
    const selectedList = allShortlisted.filter((c) => c.finalSelectionStatus === 'SELECTED');
    if (selectedList.length === 0) {
      alert('No candidates marked as SELECTED yet. Use the status buttons to select members first.');
      return;
    }

    // Group by Domain
    const grouped = {};
    selectedList.forEach((c) => {
      const dom = c.currentDomain || 'General';
      if (!grouped[dom]) grouped[dom] = [];
      grouped[dom].push(c);
    });

    let text = `=========================================\n`;
    text += `GDGoC VJIT 2026-2027 CONFIRMED SELECTED MEMBERS\n`;
    text += `Total Admitted Members: ${selectedList.length}\n`;
    text += `Generated: ${new Date().toLocaleDateString()}\n`;
    text += `=========================================\n\n`;

    Object.keys(grouped).forEach((domainName) => {
      text += `--- ${domainName.toUpperCase()} (${grouped[domainName].length}) ---\n`;
      grouped[domainName].forEach((c, i) => {
        text += `${i + 1}. ${c.name || 'N/A'} | Roll: ${c.rollNumber} | Year: ${c.yearOfStudy} | Branch: ${c.branch || 'N/A'} | Email: ${c.email || 'N/A'} | Phone: ${c.phone || 'N/A'}\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(`Copied roster of ${selectedList.length} selected members!`);
      setTimeout(() => setCopyFeedback(''), 4000);
    });
  };

  // Export CSV of Current View
  const handleExportCSV = () => {
    const targetList = filteredCandidates;
    if (targetList.length === 0) {
      alert('No candidates to export.');
      return;
    }

    const headers = [
      'Candidate ID',
      'Name',
      'Roll Number',
      'Email',
      'Phone',
      'Domain',
      'Year of Study',
      'Branch',
      'Shortlist Status',
      'Final Admission Status'
    ];

    const rows = targetList.map((c) => [
      `"${c.candidateId || ''}"`,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.rollNumber || ''}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.currentDomain || ''}"`,
      `"${c.yearOfStudy || ''}"`,
      `"${c.branch || ''}"`,
      `"${c.shortlistStatus || ''}"`,
      `"${c.finalSelectionStatus || 'PENDING'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `gdgoc_vjit_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#171717]" />
            Organiser Selection & Final Club Roster
          </h2>
          <p className="text-xs text-[#737373] mt-1">
            Review candidates shortlisted by team leads, confirm official club admission, manage waitlists, and export final rosters.
          </p>
        </div>

        {/* Global Roster Export & Copy Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={fetchCandidates}
            className="p-2 rounded-full border border-[#E5E5E5] bg-white hover:bg-[#F4F4F4] text-[#171717] transition-all shadow-2xs"
            title="Refresh candidate records"
          >
            <RefreshCw className={`w-4 h-4 text-[#737373] ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleCopyRoster}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full bg-[#171717] text-white hover:bg-black transition-all shadow-2xs active:scale-[0.98]"
            title="Copy all confirmed SELECTED members formatted for WhatsApp/Announcements"
          >
            <Copy className="w-3.5 h-3.5 text-[#7AF1A7]" />
            <span>Copy Selected Roster ({totalSelected})</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-full bg-white border border-[#E5E5E5] text-[#171717] hover:bg-[#F4F4F4] transition-all shadow-2xs"
            title="Export filtered records as CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#737373]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {copyFeedback && (
        <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#B8F7CF] text-xs text-[#166534] flex items-center justify-between gap-2 shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#7AF1A7] shrink-0" />
            <span className="font-semibold">{copyFeedback}</span>
          </div>
          <span className="text-[11px] text-[#166534]/70">Ready to paste into announcements</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Decision Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Total Shortlisted Card */}
        <div
          onClick={() => { setFinalStatusFilter('ALL'); setSelectedDomain('ALL'); }}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            finalStatusFilter === 'ALL' && selectedDomain === 'ALL'
              ? 'bg-[#171717] text-white border-[#171717] shadow-ambient'
              : 'bg-white border-[#E5E5E5] hover:border-slate-300 shadow-ambient'
          }`}
        >
          <span className={`text-[11px] font-medium block truncate ${finalStatusFilter === 'ALL' && selectedDomain === 'ALL' ? 'text-white/70' : 'text-[#737373]'}`}>
            Total Shortlisted
          </span>
          <p className="text-2xl font-bold mt-1 tracking-tight">{allShortlisted.length}</p>
        </div>

        {/* Selected Members Card */}
        <div
          onClick={() => setFinalStatusFilter('SELECTED')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            finalStatusFilter === 'SELECTED'
              ? 'bg-[#171717] text-[#7AF1A7] border-[#171717] ring-2 ring-[#7AF1A7] shadow-ambient'
              : 'bg-[#F0FDF4] border-[#B8F7CF] text-[#166534] hover:border-[#7AF1A7] shadow-ambient'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold block truncate">Selected Members</span>
            <span className="w-2 h-2 rounded-full bg-[#7AF1A7]" />
          </div>
          <p className="text-2xl font-bold mt-1 tracking-tight">{totalSelected}</p>
        </div>

        {/* Waitlisted Card */}
        <div
          onClick={() => setFinalStatusFilter('WAITLISTED')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            finalStatusFilter === 'WAITLISTED'
              ? 'bg-[#FFFBEB] text-[#92400E] border-[#F59E0B] ring-2 ring-[#FDE68A] shadow-ambient'
              : 'bg-white border-[#E5E5E5] hover:border-amber-300 shadow-ambient'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737373] block truncate">Waitlisted</span>
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
          </div>
          <p className="text-2xl font-bold text-[#92400E] mt-1 tracking-tight">{totalWaitlisted}</p>
        </div>

        {/* Rejected Card */}
        <div
          onClick={() => setFinalStatusFilter('REJECTED')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            finalStatusFilter === 'REJECTED'
              ? 'bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-200 shadow-ambient'
              : 'bg-white border-[#E5E5E5] hover:border-rose-200 shadow-ambient'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737373] block truncate">Rejected</span>
            <span className="w-2 h-2 rounded-full bg-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-1 tracking-tight">{totalRejected}</p>
        </div>

        {/* Pending Decision Card */}
        <div
          onClick={() => setFinalStatusFilter('PENDING')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all col-span-2 sm:col-span-1 ${
            finalStatusFilter === 'PENDING'
              ? 'bg-[#F4F4F4] text-[#171717] border-[#171717] shadow-ambient'
              : 'bg-white border-[#E5E5E5] hover:border-slate-300 shadow-ambient'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737373] block truncate">Pending Decision</span>
            <span className="w-2 h-2 rounded-full bg-[#A3A3A3]" />
          </div>
          <p className="text-2xl font-bold text-[#525252] mt-1 tracking-tight">{totalPending}</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-4 shadow-ambient space-y-3">
        {/* Status Filter Segmented Pills */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="inline-flex items-center bg-[#F4F4F4] p-0.5 rounded-full border border-[#E5E5E5] text-xs max-w-full overflow-x-auto no-scrollbar shrink-0">
            <button
              type="button"
              onClick={() => setFinalStatusFilter('ALL')}
              className={`px-3.5 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
                finalStatusFilter === 'ALL'
                  ? 'bg-white text-[#171717] font-semibold shadow-2xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              All Shortlisted ({allShortlisted.length})
            </button>
            <button
              type="button"
              onClick={() => setFinalStatusFilter('SELECTED')}
              className={`px-3.5 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
                finalStatusFilter === 'SELECTED'
                  ? 'bg-[#171717] text-[#7AF1A7] font-semibold shadow-2xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              Selected Members ({totalSelected})
            </button>
            <button
              type="button"
              onClick={() => setFinalStatusFilter('WAITLISTED')}
              className={`px-3.5 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
                finalStatusFilter === 'WAITLISTED'
                  ? 'bg-[#FFFBEB] text-[#92400E] font-semibold shadow-2xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              Waitlisted ({totalWaitlisted})
            </button>
            <button
              type="button"
              onClick={() => setFinalStatusFilter('REJECTED')}
              className={`px-3.5 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
                finalStatusFilter === 'REJECTED'
                  ? 'bg-rose-50 text-rose-700 font-semibold shadow-2xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              Rejected ({totalRejected})
            </button>
            <button
              type="button"
              onClick={() => setFinalStatusFilter('PENDING')}
              className={`px-3.5 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
                finalStatusFilter === 'PENDING'
                  ? 'bg-white text-[#171717] font-semibold shadow-2xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              Pending ({totalPending})
            </button>
          </div>

          {/* Academic Year Switcher */}
          <div className="inline-flex items-center bg-[#F4F4F4] p-0.5 rounded-full border border-[#E5E5E5] text-xs max-w-full overflow-x-auto no-scrollbar shrink-0">
            <button
              type="button"
              onClick={() => setSelectedYear('ALL')}
              className={`px-3 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
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
              className={`px-3 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
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
              className={`px-3 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
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
              className={`px-3 py-1 rounded-full shrink-0 whitespace-nowrap transition-all ${
                selectedYear === '3rd Year'
                  ? 'bg-white text-amber-700 font-semibold shadow-2xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              3rd Year
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#A3A3A3] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidates by name, roll number, email, or candidate ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#171717] text-[#171717] bg-[#FAFAFA] placeholder-[#A3A3A3]"
          />
        </div>

        {/* Domain Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#F4F4F4]">
          <button
            type="button"
            onClick={() => setSelectedDomain('ALL')}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
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
                type="button"
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
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

      {/* Main Roster Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-12 text-center shadow-ambient">
          <div className="w-8 h-8 border-2 border-[#E5E5E5] border-t-[#171717] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#737373] font-medium">Fetching candidate roster records...</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-12 text-center shadow-ambient">
          <div className="w-12 h-12 rounded-full bg-[#F4F4F4] flex items-center justify-center mx-auto mb-3 text-[#737373]">
            <User className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-[#171717]">No candidates found</h4>
          <p className="text-xs text-[#737373] mt-1 max-w-sm mx-auto">
            {allShortlisted.length === 0
              ? 'Team leads have not marked any candidates as shortlisted yet. Shortlisted candidates will appear here as interviews conclude.'
              : 'No candidates match your current filter combination.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Mobile Card View (< md) */}
          <div className="block md:hidden space-y-3">
            {filteredCandidates.map((c) => {
              const isUpdating = updatingId === c._id;
              const currentStatus = c.finalSelectionStatus || 'PENDING';

              return (
                <div
                  key={c._id}
                  className="p-4 rounded-2xl bg-white border border-[#E5E5E5] shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-[#171717] truncate">
                        {c.name || c.rollNumber}
                      </h4>
                      <p className="text-[11px] text-[#737373] font-mono mt-0.5 truncate">
                        {c.rollNumber} · {c.candidateId}
                      </p>
                    </div>
                    <FinalStatusBadge status={currentStatus} />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#F4F4F4]">
                    <DomainBadge domain={c.currentDomain} />
                    <YearBadge year={c.yearOfStudy} />
                    <span className="text-[11px] text-[#525252] truncate">
                      {c.branch} {c.section ? `· Sec ${c.section}` : ''}
                    </span>
                  </div>

                  {c.email && (
                    <p className="text-[11px] text-[#737373] truncate">{c.email}</p>
                  )}

                  {/* Inline Decision Buttons */}
                  <div className="pt-2 border-t border-[#F4F4F4] flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(c._id, 'SELECTED')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shadow-2xs ${
                          currentStatus === 'SELECTED'
                            ? 'bg-[#171717] text-[#7AF1A7] ring-1 ring-[#7AF1A7]'
                            : 'bg-[#171717] text-white hover:bg-black'
                        }`}
                      >
                        Select
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(c._id, 'WAITLISTED')}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                          currentStatus === 'WAITLISTED'
                            ? 'bg-[#FFFBEB] text-[#92400E] border-[#F59E0B] ring-1 ring-[#FDE68A] font-semibold'
                            : 'bg-white text-[#92400E] border-[#FDE68A] hover:bg-[#FFFBEB]'
                        }`}
                      >
                        Waitlist
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(c._id, 'REJECTED')}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                          currentStatus === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border-rose-300 font-semibold'
                            : 'bg-white text-[#737373] hover:text-rose-600 border-[#E5E5E5]'
                        }`}
                      >
                        Reject
                      </button>
                    </div>

                    <Link
                      to={`/admin/candidates/${c._id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-[#171717] bg-[#F4F4F4] hover:bg-[#E5E5E5] transition-all"
                    >
                      <span>Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (md+) */}
          <div className="hidden md:block bg-white rounded-2xl border border-[#E5E5E5] shadow-ambient overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[#737373] font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-medium">Candidate</th>
                    <th className="py-3 px-4 font-medium">Contact</th>
                    <th className="py-3 px-4 font-medium">Year & Branch</th>
                    <th className="py-3 px-4 font-medium">Domain Team</th>
                    <th className="py-3 px-4 font-medium">Lead Endorsement</th>
                    <th className="py-3 px-4 font-medium">Final Admission Status</th>
                    <th className="py-3 px-4 font-medium">Quick Decision Action</th>
                    <th className="py-3 px-4 text-right font-medium">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F4F4]">
                  {filteredCandidates.map((c) => {
                    const isUpdating = updatingId === c._id;
                    const currentStatus = c.finalSelectionStatus || 'PENDING';

                    return (
                      <tr key={c._id} className="hover:bg-[#F0FDF4]/30 transition-colors">
                        {/* Identification */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#171717] block">
                            {c.name || c.rollNumber}
                          </span>
                          <span className="text-[10px] text-[#737373] font-mono tracking-tight block">
                            {c.rollNumber} · {c.candidateId}
                          </span>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4">
                          <span className="text-[#171717] block truncate max-w-[150px] font-medium" title={c.email}>
                            {c.email}
                          </span>
                          <span className="text-[#737373] text-[11px] block">{c.phone || 'N/A'}</span>
                        </td>

                        {/* Academic */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <YearBadge year={c.yearOfStudy} />
                            <span className="text-[#171717] font-medium">{c.branch}</span>
                          </div>
                          {c.section && <span className="text-[#737373] text-[10px] block mt-0.5">Sec {c.section}</span>}
                        </td>

                        {/* Domain Team */}
                        <td className="py-3.5 px-4">
                          <DomainBadge domain={c.currentDomain} />
                        </td>

                        {/* Lead Endorsement */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <ShortlistBadge status={c.shortlistStatus} />
                            {c.assignedLead && (
                              <span className="text-[10px] text-[#737373] block truncate max-w-[130px]">
                                by {c.assignedLead.name || c.assignedLead}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Current Final Status Badge */}
                        <td className="py-3.5 px-4">
                          <FinalStatusBadge status={currentStatus} />
                        </td>

                        {/* Quick Admission Action Selector */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(c._id, 'SELECTED')}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shadow-2xs active:scale-[0.98] ${
                                currentStatus === 'SELECTED'
                                  ? 'bg-[#171717] text-[#7AF1A7] ring-1 ring-[#7AF1A7]'
                                  : 'bg-[#171717] text-white hover:bg-black'
                              }`}
                              title="Confirm as Official Selected Member"
                            >
                              Selected
                            </button>

                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(c._id, 'WAITLISTED')}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                                currentStatus === 'WAITLISTED'
                                  ? 'bg-[#FFFBEB] text-[#92400E] border-[#F59E0B] ring-1 ring-[#FDE68A] font-semibold'
                                  : 'bg-white text-[#92400E] border-[#FDE68A] hover:bg-[#FFFBEB]'
                              }`}
                              title="Place Candidate on Waitlist"
                            >
                              Waitlist
                            </button>

                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(c._id, 'REJECTED')}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                                currentStatus === 'REJECTED'
                                  ? 'bg-rose-50 text-rose-700 border-rose-300 font-semibold'
                                  : 'bg-white text-[#737373] hover:text-rose-600 border-[#E5E5E5] hover:border-rose-200'
                              }`}
                              title="Reject Candidate"
                            >
                              Reject
                            </button>

                            {currentStatus !== 'PENDING' && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleStatusChange(c._id, 'PENDING')}
                                className="px-2 py-1 text-xs text-[#737373] hover:text-[#171717] hover:bg-[#F4F4F4] rounded-full transition-all"
                                title="Reset to Pending Decision"
                              >
                                Reset
                              </button>
                            )}

                            {isUpdating && (
                              <div className="w-3.5 h-3.5 border-2 border-[#171717] border-t-transparent rounded-full animate-spin shrink-0" />
                            )}
                          </div>
                        </td>

                        {/* View Profile */}
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/admin/candidates/${c._id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-[#171717] bg-[#F4F4F4] hover:bg-[#E5E5E5] transition-all"
                          >
                            <span>View</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
