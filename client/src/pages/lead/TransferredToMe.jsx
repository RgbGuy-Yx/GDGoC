import React, { useState, useEffect } from 'react';
import { getAssignedCandidates } from '../../api/candidateApi';
import { CandidateTable } from '../../components/candidates/CandidateTable';
import { ArrowDownLeft, Info, RefreshCw } from 'lucide-react';

export const TransferredToMe = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchTransferredCandidates = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getAssignedCandidates({ limit: 500 });
        if (cancelled) return;
        if (res.success) {
          // Candidates where originalDomain is different from currentDomain
          const transferred = (res.data || []).filter(
            (c) => c.originalDomain && c.currentDomain && c.originalDomain !== c.currentDomain
          );
          setCandidates(transferred);
        } else {
          setError('The server did not return transferred candidates.');
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Network or server error.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTransferredCandidates();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="w-5 h-5 text-[#171717]" />
            <h2 className="text-2xl font-bold text-[#171717] tracking-tight">Transferred to My Domain</h2>
          </div>
          <p className="text-xs text-[#737373] mt-0.5">
            Candidates originally applying to another domain who were redirected to your team
          </p>
        </div>
        {!error && !loading && (
          <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[#171717] text-xs font-semibold self-start sm:self-auto shadow-2xs">
            {candidates.length} Inbound Transfers
          </span>
        )}
      </div>

      <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E5E5] text-xs text-[#525252] flex items-start gap-2.5 shadow-ambient">
        <Info className="w-4 h-4 shrink-0 text-[#171717] mt-0.5" />
        <p>
          You have full access to view their original Google Form responses, prior technical scores, and notes written by the referring lead.
        </p>
      </div>

      {error ? (
        <div role="alert" className="bg-white rounded-2xl border border-rose-200 p-10 text-center shadow-ambient">
          <p className="text-sm font-semibold text-[#171717]">Could not load transferred candidates</p>
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
          candidates={candidates}
          loading={loading}
          baseDetailPath="/lead/candidates"
        />
      )}
    </div>
  );
};
