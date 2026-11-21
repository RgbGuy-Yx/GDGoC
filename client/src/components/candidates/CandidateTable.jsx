import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShortlistBadge, FinalStatusBadge, DomainBadge, YearBadge } from '../common/Badge';
import { ChevronRight, ArrowRight, User, Phone, Mail } from 'lucide-react';

export const CandidateTable = ({
  candidates = [],
  loading = false,
  baseDetailPath
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const detailPath = baseDetailPath || (user?.role === 'lead' ? '/lead/candidates' : '/admin/candidates');

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-ambient">
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-[#E5E5E5] border-t-[#171717] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#737373] font-medium">Fetching candidate directory...</p>
        </div>
      </div>
    );
  }

  if (!candidates || candidates.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-12 text-center shadow-ambient">
        <div className="w-12 h-12 rounded-full bg-[#F4F4F4] flex items-center justify-center mx-auto mb-3 text-[#737373]">
          <User className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-[#171717]">No candidates found</h4>
        <p className="text-xs text-[#737373] mt-1 max-w-sm mx-auto">
          No records match the selected criteria or search filter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Mobile Card List (Visible on < md screens) */}
      <div className="block md:hidden space-y-2.5">
        {candidates.map((c) => {
          const isTransferred = c.originalDomain !== c.currentDomain;
          return (
            <div
              key={c._id}
              onClick={() => navigate(`${detailPath}/${c._id}`)}
              className="p-4 rounded-2xl bg-white border border-[#E5E5E5] shadow-2xs hover:border-[#7AF1A7] active:bg-[#F0FDF4]/40 active:scale-[0.99] transition-all cursor-pointer space-y-3"
            >
              {/* Top row: Name & Shortlist Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-[#171717] truncate">
                    {c.name ? c.name : c.rollNumber}
                  </h4>
                  <p className="text-[11px] text-[#737373] font-mono mt-0.5 truncate">
                    {c.rollNumber} {c.candidateId ? `· ${c.candidateId}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                  <ShortlistBadge status={c.shortlistStatus} />
                  {c.finalSelectionStatus && c.finalSelectionStatus !== 'PENDING' && (
                    <FinalStatusBadge status={c.finalSelectionStatus} />
                  )}
                  <ChevronRight className="w-4 h-4 text-[#A3A3A3]" />
                </div>
              </div>

              {/* Badges row: Domain, Year, Branch */}
              <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#F4F4F4]">
                <DomainBadge domain={c.currentDomain} />
                <YearBadge year={c.yearOfStudy} />
                <span className="text-[11px] text-[#525252] font-medium truncate">
                  {c.branch} {c.section ? `· Sec ${c.section}` : ''}
                </span>
                {isTransferred && (
                  <span className="text-[10px] bg-[#FFFBEB] text-amber-800 px-2 py-0.5 rounded-full border border-[#FDE68A] font-medium">
                    Transferred
                  </span>
                )}
              </div>

              {/* Contact mini row */}
              {(c.email || c.phone) && (
                <div className="flex items-center gap-3 text-[11px] text-[#737373] pt-1">
                  {c.email && (
                    <span className="truncate max-w-[200px]" title={c.email}>
                      {c.email}
                    </span>
                  )}
                  {c.phone && <span className="shrink-0">· {c.phone}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Data Table (Visible on md+ screens) */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#E5E5E5] shadow-ambient overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[#737373] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-medium">Candidate / Roll No</th>
                <th className="py-3 px-4 font-medium">Contact</th>
                <th className="py-3 px-4 font-medium">Year & Branch</th>
                <th className="py-3 px-4 font-medium">Domain Status</th>
                <th className="py-3 px-4 font-medium">Assigned Lead</th>
                <th className="py-3 px-4 font-medium">Shortlist</th>
                <th className="py-3 px-4 font-medium">Final Status</th>
                <th className="py-3 px-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F4]">
              {candidates.map((c) => {
                const isTransferred = c.originalDomain !== c.currentDomain;
                return (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`${detailPath}/${c._id}`)}
                    className="hover:bg-[#F0FDF4]/35 cursor-pointer transition-colors group"
                  >
                    {/* Candidate Identification */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#171717] block transition-colors">
                        {c.name ? c.name : c.rollNumber}
                      </span>
                      <span className="text-[10px] text-[#737373] font-mono tracking-tight block">
                        {c.rollNumber} {c.candidateId ? `· ${c.candidateId}` : ''}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4">
                      <span className="text-[#171717] block truncate max-w-[160px] font-medium" title={c.email}>
                        {c.email}
                      </span>
                      <span className="text-[#737373] text-[11px] block">{c.phone || 'N/A'}</span>
                    </td>

                    {/* Academic */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <YearBadge year={c.yearOfStudy} />
                        <span className="text-[#171717] font-medium">
                          {c.branch}
                        </span>
                      </div>
                      {c.section && <span className="text-[#737373] text-[10px] block mt-0.5">Sec {c.section}</span>}
                    </td>

                    {/* Domain & Transfer info */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <DomainBadge domain={c.currentDomain} />
                          {isTransferred && (
                            <span className="text-[10px] bg-[#FFFBEB] text-amber-800 px-2 py-0.5 rounded-full border border-[#FDE68A] font-medium">
                              Transferred
                            </span>
                          )}
                        </div>
                        {isTransferred && (
                          <span className="text-[10px] text-[#A3A3A3] block">
                            Orig: {c.originalDomain}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Assigned Lead */}
                    <td className="py-3 px-4 text-[#525252]">
                      {c.assignedLead ? (
                        <span className="font-medium text-[#171717]">{c.assignedLead.name}</span>
                      ) : (
                        <span className="text-[#A3A3A3] italic">Unassigned</span>
                      )}
                    </td>

                    {/* Shortlist Badge */}
                    <td className="py-3 px-4">
                      <ShortlistBadge status={c.shortlistStatus} />
                    </td>

                    {/* Final Selection Status */}
                    <td className="py-3 px-4">
                      <FinalStatusBadge status={c.finalSelectionStatus} />
                    </td>

                    {/* View Action */}
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#171717] group-hover:text-black py-1 px-3 rounded-full border border-[#E5E5E5] bg-white group-hover:bg-[#F4F4F4] transition-all">
                        <span>Profile</span>
                        <ChevronRight className="w-3 h-3 text-[#737373] group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
