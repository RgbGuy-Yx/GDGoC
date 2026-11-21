import React, { useState, useEffect } from 'react';
import { getAssignedCandidates } from '../../api/candidateApi';
import { CandidateTable } from '../../components/candidates/CandidateTable';
import { CheckCircle2 } from 'lucide-react';

export const LeadShortlisted = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShortlisted = async () => {
      setLoading(true);
      try {
        const res = await getAssignedCandidates({
          shortlistStatus: 'SHORTLISTED',
          limit: 200,
          sortBy: 'year'
        });
        if (res.success) {
          setCandidates(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load shortlisted candidates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShortlisted();
  }, []);

  const displayed = selectedYear
    ? candidates.filter((c) => {
      if (/^1/i.test(selectedYear)) return /^1/i.test(c.yearOfStudy);
      if (/^2/i.test(selectedYear)) return /^2/i.test(c.yearOfStudy);
      if (/^3/i.test(selectedYear)) return /^3/i.test(c.yearOfStudy);
      return true;
    })
    : candidates;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#7AF1A7]" />
            <h2 className="text-2xl font-bold text-[#171717] tracking-tight">Shortlisted Candidates</h2>
          </div>
          <p className="text-xs text-[#737373] mt-0.5">
            Candidates evaluated and shortlisted by your team lead review ({candidates.length} total)
          </p>
        </div>

        {/* Minimal Segmented Year Switcher */}
        <div className="inline-flex items-center bg-[#F4F4F4] p-0.5 rounded-full border border-[#E5E5E5] text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedYear('')}
            className={`px-3.5 py-1 rounded-full transition-all ${!selectedYear
              ? 'bg-white text-[#171717] font-semibold shadow-2xs'
              : 'text-[#737373] hover:text-[#171717]'
              }`}
          >
            All Years ({candidates.length})
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
        candidates={displayed}
        loading={loading}
        baseDetailPath="/lead/candidates"
      />
    </div>
  );
};
