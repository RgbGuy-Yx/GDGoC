import React, { useState, useEffect } from 'react';
import { getAllCandidates } from '../../api/candidateApi';
import { useDomains } from '../../hooks/useDomains';
import { CandidateTable } from '../../components/candidates/CandidateTable';
import { Layers, Users, CheckCircle2, Clock } from 'lucide-react';

export const DomainCandidates = () => {
  const { domains } = useDomains();
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Set default selected domain when domains load
  useEffect(() => {
    if (!selectedDomain && domains.length > 0) {
      setSelectedDomain(domains[0]);
    }
  }, [domains, selectedDomain]);

  // Load all candidates for counts
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await getAllCandidates({ limit: 1000 });
        if (res.success) {
          setAllCandidates(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load candidate stats:', err);
      }
    };
    fetchAll();
  }, []);

  // Fetch candidates for current domain and selected year
  useEffect(() => {
    if (!selectedDomain) return;

    const fetchDomainCandidates = async () => {
      setLoading(true);
      try {
        const res = await getAllCandidates({
          domain: selectedDomain,
          yearOfStudy: selectedYear || undefined,
          sortBy: 'year', // 1st Year first
          limit: 500
        });
        if (res.success) {
          setCandidates(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load domain candidates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDomainCandidates();
  }, [selectedDomain, selectedYear]);

  // Compute stats for selected domain
  const domainCandidates = allCandidates.filter((c) => c.currentDomain === selectedDomain);
  const total = domainCandidates.length;
  const shortlisted = domainCandidates.filter((c) => c.shortlistStatus === 'SHORTLISTED').length;
  const pending = domainCandidates.filter((c) => c.shortlistStatus === 'PENDING' || c.shortlistStatus === 'IN_REVIEW').length;
  const selected = domainCandidates.filter((c) => c.finalSelectionStatus === 'SELECTED').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#171717] tracking-tight">Domain-wise Candidates</h2>
        <p className="text-xs text-[#737373] mt-0.5">
          Segment and evaluate candidate pipelines across specific technical and non-technical domains
        </p>
      </div>

      {/* Domain Selection Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5E5E5] pb-4">
        {domains.map((dom) => {
          const count = allCandidates.filter((c) => c.currentDomain === dom).length;
          const isSelected = selectedDomain === dom;
          return (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-[#171717] text-white shadow-2xs font-semibold'
                  : 'bg-white text-[#525252] hover:text-[#171717] border border-[#E5E5E5] hover:bg-[#F4F4F4]'
              }`}
            >
              <span>{dom}</span>
              <span
                className={`px-2 py-0.2 rounded-full text-[10px] ${
                  isSelected ? 'bg-white/20 text-[#7AF1A7] font-bold' : 'bg-[#F4F4F4] text-[#737373]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Domain Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-ambient">
          <div className="flex items-center justify-between text-[#737373] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Domain Total</span>
            <Users className="w-4 h-4 text-[#171717]" />
          </div>
          <p className="text-2xl font-bold text-[#171717] tracking-tight">{total}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-ambient">
          <div className="flex items-center justify-between text-[#737373] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#166534]">Shortlisted</span>
            <CheckCircle2 className="w-4 h-4 text-[#7AF1A7]" />
          </div>
          <p className="text-2xl font-bold text-[#171717] tracking-tight">{shortlisted}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-ambient">
          <div className="flex items-center justify-between text-[#737373] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#92400E]">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-[#171717] tracking-tight">{pending}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-ambient">
          <div className="flex items-center justify-between text-[#737373] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Final Selected</span>
            <Layers className="w-4 h-4 text-[#171717]" />
          </div>
          <p className="text-2xl font-bold text-[#171717] tracking-tight">{selected}</p>
        </div>
      </div>

      {/* Candidate List Section with Inline Minimal Year Control */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#171717] tracking-tight">
              {selectedDomain} Candidate Roster ({candidates.length})
            </h3>
            <p className="text-[11px] text-[#737373]">
              Interview sequence: 1st Years prioritized, followed by 2nd and 3rd Years
            </p>
          </div>

          <div className="inline-flex items-center bg-[#F4F4F4] p-0.5 rounded-full border border-[#E5E5E5] text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectedYear('')}
              className={`px-3.5 py-1 rounded-full transition-all ${
                !selectedYear
                  ? 'bg-white text-[#171717] font-semibold shadow-2xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              All Years
            </button>
            <button
              type="button"
              onClick={() => setSelectedYear('1st Year')}
              className={`px-3.5 py-1 rounded-full transition-all ${
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
              className={`px-3.5 py-1 rounded-full transition-all ${
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
              className={`px-3.5 py-1 rounded-full transition-all ${
                selectedYear === '3rd Year'
                  ? 'bg-white text-amber-700 font-semibold shadow-2xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              3rd Year
            </button>
          </div>
        </div>

        {/* Candidate Table */}
        <CandidateTable
          candidates={candidates}
          loading={loading}
          baseDetailPath="/admin/candidates"
        />
      </div>
    </div>
  );
};
