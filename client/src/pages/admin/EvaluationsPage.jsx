import React, { useState, useEffect } from 'react';
import { getAllEvaluationsAdmin } from '../../api/evaluationApi';
import { Link } from 'react-router-dom';
import { Award, Search, User, Calendar, MessageSquare, ChevronRight } from 'lucide-react';
import { DomainBadge } from '../../components/common/Badge';

export const EvaluationsPage = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEvaluations = async () => {
      setLoading(true);
      try {
        const res = await getAllEvaluationsAdmin();
        if (res.success) {
          setEvaluations(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load evaluations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
  }, []);

  const filtered = evaluations.filter((ev) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      ev.candidate?.rollNumber?.toLowerCase().includes(s) ||
      ev.candidate?.email?.toLowerCase().includes(s) ||
      ev.leadName?.toLowerCase().includes(s) ||
      ev.remarks?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#171717] tracking-tight">Interview Evaluations</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Audit logs of all technical & HR evaluations, scores out of 10, and lead remarks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[#171717] text-xs font-semibold shadow-2xs">
            {evaluations.length} Recorded Evaluations
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-ambient">
        <div className="relative">
          <Search className="w-4 h-4 text-[#A3A3A3] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search evaluations by candidate roll no, email, lead name, or keywords in remarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#171717] text-[#171717] bg-[#FAFAFA] placeholder-[#A3A3A3]"
          />
        </div>
      </div>

      {/* Evaluations Feed */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-12 text-center shadow-ambient">
          <div className="w-8 h-8 border-2 border-[#E5E5E5] border-t-[#171717] rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#737373] font-medium">Loading evaluation history...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-12 text-center text-xs text-[#737373] shadow-ambient">
          <Award className="w-8 h-8 text-[#A3A3A3] mx-auto mb-2" />
          <p className="font-semibold text-[#171717]">No evaluations found</p>
          <p className="mt-0.5 text-[#737373]">Evaluations submitted by team leads during candidate interviews will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ev) => {
            return (
              <div
                key={ev._id}
                className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-ambient hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4F4F4]">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#166534] border border-[#B8F7CF]">
                      Score: {ev.score} / 10
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/candidates/${ev.candidate?._id}`}
                          className="font-semibold text-[#171717] hover:underline text-xs flex items-center gap-1 group"
                        >
                          <span>{ev.candidate?.rollNumber || 'Candidate'}</span>
                          <span className="text-[#737373] font-mono text-[10px]">({ev.candidate?.candidateId})</span>
                          <ChevronRight className="w-3 h-3 text-[#737373] group-hover:text-[#171717]" />
                        </Link>
                        {ev.candidate?.currentDomain && (
                          <DomainBadge domain={ev.candidate.currentDomain} />
                        )}
                      </div>
                      <p className="text-[11px] text-[#737373]">{ev.candidate?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#737373] self-start sm:self-auto">
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#171717]">
                      <User className="w-3.5 h-3.5 text-[#737373]" />
                      Evaluated by {ev.leadName} ({ev.evaluatorRole})
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#737373]">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(ev.timestamp || ev.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Remarks Quote */}
                <div className="bg-[#FAFAFA] p-3.5 rounded-xl border border-[#F4F4F4] text-xs text-[#171717] flex items-start gap-2.5">
                  <MessageSquare className="w-4 h-4 text-[#737373] shrink-0 mt-0.5" />
                  <p className="leading-relaxed whitespace-pre-wrap">{ev.remarks}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
