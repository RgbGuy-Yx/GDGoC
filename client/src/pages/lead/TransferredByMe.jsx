import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTransferredByMe } from '../../api/transferApi';
import { ArrowUpRight, ArrowRight, Calendar, RefreshCw } from 'lucide-react';

export const TransferredByMe = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchTransfers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getTransferredByMe();
        if (cancelled) return;
        if (res.success) {
          setTransfers(res.data || []);
        } else {
          setError('The server did not return your transfers.');
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Network or server error.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTransfers();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

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
        {!error && !loading && (
          <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[#171717] text-xs font-semibold self-start sm:self-auto shadow-2xs">
            {transfers.length} Outbound Transfers
          </span>
        )}
      </div>

      {loading ? (
        <div role="status" className="bg-white rounded-2xl border border-[#E5E5E5] p-12 text-center shadow-ambient">
          <div className="w-8 h-8 border-2 border-[#E5E5E5] border-t-[#171717] rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#737373] font-medium">Loading transfer logs...</p>
        </div>
      ) : error ? (
        <div role="alert" className="bg-white rounded-2xl border border-rose-200 p-10 text-center shadow-ambient">
          <p className="text-sm font-semibold text-[#171717]">Could not load your transfers</p>
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
      ) : transfers.length === 0 ? (
        <div role="status" className="bg-white rounded-2xl border border-[#E5E5E5] p-12 text-center text-xs text-[#737373] shadow-ambient">
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

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#737373]">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(t.timestamp || t.createdAt).toLocaleString()}
                  </span>
                  {t.candidate?._id && (
                    <Link
                      to={`/lead/candidates/${t.candidate._id}`}
                      className="text-xs font-medium text-[#1a73e8] hover:underline whitespace-nowrap"
                    >
                      View profile &rarr;
                    </Link>
                  )}
                </div>
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
