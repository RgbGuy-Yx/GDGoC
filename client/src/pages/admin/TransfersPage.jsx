import React, { useState, useEffect } from 'react';
import { getAllTransfersAdmin } from '../../api/transferApi';
import { Link } from 'react-router-dom';
import {
  ArrowRightLeft,
  Search,
  ArrowRight,
  User,
  Calendar,
  ChevronRight,
  Info
} from 'lucide-react';
import { DomainBadge } from '../../components/common/Badge';

export const TransfersPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTransfers = async () => {
      setLoading(true);
      try {
        const res = await getAllTransfersAdmin();
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

  const filtered = transfers.filter((t) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      t.candidate?.rollNumber?.toLowerCase().includes(s) ||
      t.candidate?.email?.toLowerCase().includes(s) ||
      t.previousDomain?.toLowerCase().includes(s) ||
      t.destinationDomain?.toLowerCase().includes(s) ||
      t.transferReason?.toLowerCase().includes(s) ||
      t.transferredBy?.name?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#171717] tracking-tight">Candidate Transfer History</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Immutable audit logs of all cross-domain candidate movements, motivations, and lead handovers
          </p>
        </div>
        <div>
          <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[#171717] text-xs font-semibold shadow-2xs">
            {transfers.length} Recorded Transfers
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-ambient">
        <div className="relative">
          <Search className="w-4 h-4 text-[#A3A3A3] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transfer history by roll number, domain, lead name, or justification..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#171717] text-[#171717] bg-[#FAFAFA] placeholder-[#A3A3A3]"
          />
        </div>
      </div>

      {/* Transfer History Feed */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-12 text-center shadow-ambient">
          <div className="w-8 h-8 border-2 border-[#E5E5E5] border-t-[#171717] rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#737373] font-medium">Loading transfer logs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-12 text-center text-xs text-[#737373] shadow-ambient">
          <ArrowRightLeft className="w-8 h-8 text-[#A3A3A3] mx-auto mb-2" />
          <p className="font-semibold text-[#171717]">No transfer records found</p>
          <p className="mt-0.5 text-[#737373]">
            Candidates transferred between technical or non-technical domains will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((t) => (
            <div
              key={t._id}
              className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-ambient hover:border-slate-300 transition-all space-y-4"
            >
              {/* Top Row: Candidate + Timestamp */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F4F4F4]">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/candidates/${t.candidate?._id}`}
                    className="font-semibold text-[#171717] hover:underline text-xs flex items-center gap-1 group"
                  >
                    <span>{t.candidate?.rollNumber || 'Candidate'}</span>
                    <span className="text-[#737373] font-mono text-[10px]">
                      ({t.candidate?.candidateId})
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#737373] group-hover:text-[#171717]" />
                  </Link>
                  <span className="text-[#A3A3A3] text-xs">·</span>
                  <span className="text-xs text-[#737373]">{t.candidate?.email}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#737373] self-start sm:self-auto">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#171717]">
                    <User className="w-3.5 h-3.5 text-[#737373]" />
                    Transferred by {t.transferredBy?.name || 'Lead'} ({t.transferredBy?.role || 'lead'})
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#737373]">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(t.timestamp || t.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Transfer Path Box */}
              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Source */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider block">
                    Source Domain
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#171717]">{t.previousDomain}</span>
                    {t.previousLead && (
                      <span className="text-[11px] text-[#737373]">
                        (Lead: {t.previousLead?.name || 'Lead'})
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex items-center justify-center px-4">
                  <div className="p-2 rounded-full bg-[#171717] text-white">
                    <ArrowRight className="w-3.5 h-3.5 text-[#7AF1A7]" />
                  </div>
                </div>

                {/* Destination */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider block">
                    Destination Domain
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#171717]">{t.destinationDomain}</span>
                    {t.destinationLead && (
                      <span className="text-[11px] text-[#737373]">
                        (Assigned: {t.destinationLead?.name || 'Lead'})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Reason & Remarks */}
              <div className="text-xs space-y-1 pt-1">
                <p className="text-[#171717]">
                  <strong className="text-[#171717] font-semibold">Reason: </strong>
                  {t.transferReason}
                </p>
                {t.remarks && (
                  <p className="text-[#737373] italic">
                    <strong className="text-[#525252] not-italic font-medium">Lead Notes: </strong>
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
