import React, { useState, useEffect } from 'react';
import { getTransferredByMe } from '../../api/transferApi';
import { ArrowUpRight, ArrowRight, User, Calendar, Info, Layers } from 'lucide-react';
import { DomainBadge } from '../../components/common/Badge';

export const TransferredByMe = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransfers = async () => {
      setLoading(true);
      try {
        const res = await getTransferredByMe();
        if (res.success) {
          setTransfers(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load transfers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransfers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-[#171717]" />
            <h2 className="text-2xl font-bold text-[#171717] tracking-tight">Transferred by Me</h2>
          </div>
          <p className="text-xs text-[#737373] mt-0.5">
            Audit log of candidates you transferred out to another technical or non-technical domain
          </p>
        </div>
        <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[#171717] text-xs font-semibold self-start sm:self-auto shadow-2xs">
          {transfers.length} Outbound Transfers
        </span>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-12 text-center shadow-ambient">
          <div className="w-8 h-8 border-2 border-[#E5E5E5] border-t-[#171717] rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#737373] font-medium">Loading transfer logs...</p>
        </div>
      ) : transfers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-12 text-center text-xs text-[#737373] shadow-ambient">
          <ArrowUpRight className="w-8 h-8 text-[#A3A3A3] mx-auto mb-2" />
          <p className="font-semibold text-[#171717]">No outbound transfers</p>
          <p className="mt-0.5 text-[#737373]">
            Candidates you transfer to another team lead or domain will be recorded here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transfers.map((t) => (
            <div
              key={t._id}
              className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-ambient space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F4F4F4]">
                <div>
                  <span className="font-semibold text-[#171717] text-xs">
                    {t.candidate?.rollNumber || 'Candidate'}
                  </span>
                  <span className="text-[#737373] font-mono text-[10px] ml-2">
                    ({t.candidate?.candidateId})
                  </span>
                  <span className="text-[#A3A3A3] text-xs mx-2">·</span>
                  <span className="text-xs text-[#737373]">{t.candidate?.email}</span>
                </div>

                <span className="inline-flex items-center gap-1.5 text-xs text-[#737373]">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(t.timestamp || t.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Transfer path */}
              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#737373] font-semibold uppercase block tracking-wider">
                    Transferred From
                  </span>
                  <span className="font-semibold text-[#171717] mt-0.5 block">{t.previousDomain}</span>
                </div>

                <div className="hidden md:flex items-center justify-center">
                  <div className="p-2 rounded-full bg-[#171717] text-white">
                    <ArrowRight className="w-3.5 h-3.5 text-[#7AF1A7]" />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#737373] font-semibold uppercase block tracking-wider">
                    Transferred To
                  </span>
                  <span className="font-semibold text-[#171717] mt-0.5 block">{t.destinationDomain}</span>
                  {t.destinationLead && (
                    <span className="text-[11px] text-[#737373] block mt-0.5">
                      Lead: {t.destinationLead?.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div className="text-xs space-y-1">
                <p className="text-[#171717]">
                  <strong className="text-[#171717] font-semibold">Transfer Reason: </strong>
                  {t.transferReason}
                </p>
                {t.remarks && (
                  <p className="text-[#737373] italic">
                    <strong className="text-[#525252] not-italic font-medium">Remarks: </strong>
                    {t.remarks}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
