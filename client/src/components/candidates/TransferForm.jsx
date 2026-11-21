import React, { useState, useEffect } from 'react';
import { transferCandidate } from '../../api/transferApi';
import { getAllLeads } from '../../api/leadApi';
import { useDomains } from '../../hooks/useDomains';
import { ArrowRightLeft, AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const TransferForm = ({ candidate, onTransferSuccess }) => {
  const { domains } = useDomains();
  const [destinationDomain, setDestinationDomain] = useState('');
  const [destinationLeadId, setDestinationLeadId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchLeads = async () => {
      setLoadingLeads(true);
      try {
        const res = await getAllLeads();
        if (res.success) {
          setLeads(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load team leads:', err);
      } finally {
        setLoadingLeads(false);
      }
    };
    fetchLeads();
  }, []);

  // Filter leads based on selected destination domain
  const matchingLeads = destinationDomain
    ? leads.filter((l) =>
        l.assignedDomains?.some((d) => d.toLowerCase() === destinationDomain.toLowerCase())
      )
    : leads;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!destinationDomain) {
      setError('Please select a destination domain.');
      return;
    }

    if (destinationDomain.toLowerCase() === candidate?.currentDomain?.toLowerCase()) {
      setError(`Candidate is already in the '${candidate.currentDomain}' domain.`);
      return;
    }

    if (!transferReason.trim()) {
      setError('Please provide a reason for this transfer.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await transferCandidate(candidate._id, {
        destinationDomain,
        destinationLeadId: destinationLeadId || null,
        transferReason: transferReason.trim(),
        remarks: remarks.trim()
      });

      if (res.success) {
        setSuccess(`Candidate successfully transferred to ${destinationDomain}.`);
        if (onTransferSuccess) {
          onTransferSuccess(res.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to transfer candidate.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 shadow-ambient">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-full bg-[#F4F4F4] border border-[#E5E5E5] text-[#171717]">
          <ArrowRightLeft className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-sm font-semibold text-[#171717] tracking-tight">Transfer Candidate Domain</h3>
      </div>

      <div className="mb-4 p-3 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] text-[11px] text-[#525252] flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 text-[#171717] mt-0.5" />
        <div>
          <p className="font-semibold text-[#171717]">Transfer Policy:</p>
          <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-[#737373]">
            <li>Original Applied Domain (<strong>{candidate?.originalDomain}</strong>) is permanently preserved for audit records.</li>
            <li>Transferring does <strong>NOT</strong> automatically shortlist or reject the candidate.</li>
            <li>The receiving domain lead will receive immediate access to previous evaluations.</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-[#F0FDF4] border border-[#B8F7CF] text-xs text-[#166534]">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#7AF1A7]" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Destination Domain */}
        <div>
          <label className="block text-xs font-medium text-[#171717] mb-1">
            Destination Domain <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={destinationDomain}
            onChange={(e) => {
              setDestinationDomain(e.target.value);
              setDestinationLeadId(''); // reset lead on domain change
            }}
            className="w-full px-3 py-2 text-xs border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#171717] bg-[#FAFAFA] text-[#171717]"
          >
            <option value="">-- Select Destination Domain --</option>
            {domains.map((domain) => (
              <option
                key={domain}
                value={domain}
                disabled={domain.toLowerCase() === candidate?.currentDomain?.toLowerCase()}
              >
                {domain} {domain.toLowerCase() === candidate?.currentDomain?.toLowerCase() ? '(Current)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Destination Lead */}
        <div>
          <label className="block text-xs font-medium text-[#171717] mb-1">
            Destination Team Lead (Optional)
          </label>
          <select
            value={destinationLeadId}
            onChange={(e) => setDestinationLeadId(e.target.value)}
            disabled={loadingLeads}
            className="w-full px-3 py-2 text-xs border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#171717] bg-[#FAFAFA] text-[#171717] disabled:opacity-50"
          >
            <option value="">-- Assign to Lead (Optional) --</option>
            {matchingLeads.map((lead) => (
              <option key={lead._id} value={lead._id}>
                {lead.name} ({lead.assignedDomains?.join(', ')})
              </option>
            ))}
          </select>
        </div>

        {/* Transfer Reason */}
        <div>
          <label className="block text-xs font-medium text-[#171717] mb-1">
            Reason for Transfer <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={transferReason}
            onChange={(e) => setTransferReason(e.target.value)}
            placeholder="e.g. Candidate demonstrated stronger technical depth in Web Development..."
            className="w-full px-3 py-2 text-xs border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#171717] text-[#171717] bg-[#FAFAFA]"
          />
        </div>

        {/* Additional Remarks */}
        <div>
          <label className="block text-xs font-medium text-[#171717] mb-1">
            Additional Context for Receiving Lead (Optional)
          </label>
          <textarea
            rows="2"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Any specific context or notes from initial evaluation..."
            className="w-full px-3 py-2 text-xs border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#171717] text-[#171717] bg-[#FAFAFA] placeholder-[#A3A3A3]"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#171717] hover:bg-[#262626] text-white text-xs font-medium shadow-2xs active:scale-[0.99] transition-all disabled:opacity-50"
        >
          {submitting ? 'Transferring...' : 'Confirm Candidate Transfer'}
        </button>
      </form>
    </div>
  );
};
