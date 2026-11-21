import React, { useState, useEffect } from 'react';
import { getAssignedCandidates } from '../../api/candidateApi';
import { CandidateTable } from '../../components/candidates/CandidateTable';
import { ArrowDownLeft, Info } from 'lucide-react';

export const TransferredToMe = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransferredCandidates = async () => {
      setLoading(true);
      try {
        const res = await getAssignedCandidates({ limit: 500 });
        if (res.success) {
          // Candidates where originalDomain is different from currentDomain
          const transferred = (res.data || []).filter(
            (c) => c.originalDomain && c.currentDomain && c.originalDomain !== c.currentDomain
          );
          setCandidates(transferred);
        }
      } catch (err) {
        console.error('Failed to load transferred candidates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransferredCandidates();
  }, []);

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
        <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[#171717] text-xs font-semibold self-start sm:self-auto shadow-2xs">
          {candidates.length} Inbound Transfers
        </span>
      </div>

      <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E5E5] text-xs text-[#525252] flex items-start gap-2.5 shadow-ambient">
        <Info className="w-4 h-4 shrink-0 text-[#171717] mt-0.5" />
        <p>
          You have full access to view their original Google Form responses, prior technical scores, and notes written by the referring lead.
        </p>
      </div>

      <CandidateTable
        candidates={candidates}
        loading={loading}
        baseDetailPath="/lead/candidates"
      />
    </div>
  );
};
