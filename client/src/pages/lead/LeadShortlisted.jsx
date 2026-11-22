import React, { useState, useEffect } from 'react';
import { getAssignedCandidates } from '../../api/candidateApi';
import { CandidateTable } from '../../components/candidates/CandidateTable';
import { CheckCircle2, RefreshCw } from 'lucide-react';

const YEAR_OPTIONS = [
  { value: '', activeText: 'text-[#171717]' },
  { value: '1st Year', activeText: 'text-blue-700' },
  { value: '2nd Year', activeText: 'text-purple-700' },
  { value: '3rd Year', activeText: 'text-amber-700' }
];

export const LeadShortlisted = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchShortlisted = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getAssignedCandidates({
          shortlistStatus: 'SHORTLISTED',
          limit: 200,
          sortBy: 'year'
        });
        if (cancelled) return;
        if (res.success) {
          setCandidates(res.data || []);
        } else {
          setError('The server did not return shortlisted candidates.');
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Network or server error.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchShortlisted();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

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
            <CheckCircle2 className="w-5 h-5 text-[#34A853]" />
            <h2 className="text-2xl font-bold text-[#171717] tracking-tight">Shortlisted Candidates</h2>
          </div>
          <p className="text-xs text-[#737373] mt-0.5">
            Candidates evaluated and shortlisted by your team lead review
            {!error && !loading ? ` (${candidates.length} total)` : ''}
          </p>
        </div>

        {/* Year Switcher */}
        <div className="inline-flex items-center bg-[#F4F4F4] p-0.5 rounded-full border border-[#E5E5E5] text-xs self-start sm:self-auto">
          {YEAR_OPTIONS.map((opt) => (
            <button
              key={opt.value || 'all'}
              type="button"
              onClick={() => setSelectedYear(opt.value)}
              className={`px-3.5 py-1 rounded-full transition-all ${selectedYear === opt.value
                ? `bg-white ${opt.activeText} font-semibold shadow-2xs`
                : 'text-[#737373] hover:text-[#171717]'
                }`}
            >
              {opt.value || (!error && !loading ? `All Years (${candidates.length})` : 'All Years')}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div role="alert" className="bg-white rounded-2xl border border-rose-200 p-10 text-center shadow-ambient">
          <p className="text-sm font-semibold text-[#171717]">Could not load shortlisted candidates</p>
          <p className="text-xs text-[#737373] mt-1">{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-white border border-[#E5E5E5] text-[#171717] hover:bg-[#F4F4F4] transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try again
          </button>
        </div>
      ) : (
        <CandidateTable
          candidates={displayed}
          loading={loading}
          baseDetailPath="/lead/candidates"
        />
      )}
    </div>
  );
};
