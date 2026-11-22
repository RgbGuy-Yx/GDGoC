import React, { useState, useEffect } from 'react';
import { getAssignedCandidates } from '../../api/candidateApi';
import { CandidateTable } from '../../components/candidates/CandidateTable';
import { XCircle, Clock } from 'lucide-react';

export const LeadNotShortlisted = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL_NON_SHORTLISTED'); // 'ALL_NON_SHORTLISTED', 'REJECTED', 'PENDING'

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const res = await getAssignedCandidates({ limit: 500, sortBy: 'year' });
        if (res.success) {
          const list = res.data || [];
          setCandidates(list);
        }
      } catch (err) {
        console.error('Failed to load candidates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const handleStatusChange = (candidateId, newStatus) => {
    setCandidates((prev) =>
      prev.map((c) => (c._id === candidateId ? { ...c, shortlistStatus: newStatus } : c))
    );
  };

  const pendingList = candidates.filter(
    (c) => c.shortlistStatus === 'PENDING' || c.shortlistStatus === 'IN_REVIEW'
  );
  const rejectedList = candidates.filter((c) => c.shortlistStatus === 'REJECTED');
  const waitlistedList = candidates.filter((c) => c.shortlistStatus === 'WAITLISTED');

  let displayedList =
    activeTab === 'REJECTED'
      ? rejectedList
      : activeTab === 'PENDING'
        ? pendingList
        : [...pendingList, ...waitlistedList, ...rejectedList];

  if (selectedYear) {
    displayedList = displayedList.filter((c) => {
      if (/^1/i.test(selectedYear)) return /^1/i.test(c.yearOfStudy);
      if (/^2/i.test(selectedYear)) return /^2/i.test(c.yearOfStudy);
      if (/^3/i.test(selectedYear)) return /^3/i.test(c.yearOfStudy);
      return true;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-[#737373]" />
            <h2 className="text-2xl font-bold text-[#171717] tracking-tight">
              Pending & Not Shortlisted
            </h2>
          </div>
          <p className="text-xs text-[#737373] mt-0.5">
            Candidates currently pending initial review or marked as not shortlisted
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-full bg-[#F4F4F4] border border-[#E5E5E5] p-1 text-xs font-medium text-[#737373] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('ALL_NON_SHORTLISTED')}
            className={`px-3.5 py-1 rounded-full transition-all ${activeTab === 'ALL_NON_SHORTLISTED'
              ? 'bg-[#171717] text-white font-semibold shadow-2xs'
              : 'hover:text-[#171717]'
              }`}
          >
            All ({pendingList.length + waitlistedList.length + rejectedList.length})
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3.5 py-1 rounded-full transition-all ${activeTab === 'PENDING'
              ? 'bg-[#171717] text-white font-semibold shadow-2xs'
              : 'hover:text-[#171717]'
              }`}
          >
            Pending ({pendingList.length})
          </button>
          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-3.5 py-1 rounded-full transition-all ${activeTab === 'REJECTED'
              ? 'bg-[#171717] text-white font-semibold shadow-2xs'
              : 'hover:text-[#171717]'
              }`}
          >
            Not Shortlisted ({rejectedList.length})
          </button>
        </div>
      </div>

      {/* Sub-toolbar with Minimal Segmented Year Switcher */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-xs text-[#737373] font-medium">
          Showing {displayedList.length} candidate{displayedList.length === 1 ? '' : 's'}
        </span>

        <div className="inline-flex items-center bg-[#F4F4F4] p-0.5 rounded-full border border-[#E5E5E5] text-xs">
          <button
            type="button"
            onClick={() => setSelectedYear('')}
            className={`px-3.5 py-1 rounded-full transition-all ${!selectedYear
              ? 'bg-white text-[#171717] font-semibold shadow-2xs'
              : 'text-[#737373] hover:text-[#171717]'
              }`}
          >
            All Years
          </button>
          <button
            type="button"
            onClick={() => setSelectedYear('1st Year')}
            className={`px-3.5 py-1 rounded-full transition-all ${selectedYear === '1st Year'
              ? 'bg-white text-blue-700 font-semibold shadow-2xs'
              : 'text-[#737373] hover:text-[#171717]'
              }`}
          >
            1st Year
          </button>
          <button
            type="button"
            onClick={() => setSelectedYear('2nd Year')}
            className={`px-3.5 py-1 rounded-full transition-all ${selectedYear === '2nd Year'
              ? 'bg-white text-purple-700 font-semibold shadow-2xs'
              : 'text-[#737373] hover:text-[#171717]'
              }`}
          >
            2nd Year
          </button>
          <button
            type="button"
            onClick={() => setSelectedYear('3rd Year')}
            className={`px-3.5 py-1 rounded-full transition-all ${selectedYear === '3rd Year'
              ? 'bg-white text-amber-700 font-semibold shadow-2xs'
              : 'text-[#737373] hover:text-[#171717]'
              }`}
          >
            3rd Year
          </button>
        </div>
      </div>

      <CandidateTable
        candidates={displayedList}
        loading={loading}
        baseDetailPath="/lead/candidates"
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};
