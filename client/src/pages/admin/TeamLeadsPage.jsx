import React, { useState, useEffect } from 'react';
import { getAllLeads, createLead } from '../../api/leadApi';
import { useDomains } from '../../hooks/useDomains';
import { Modal } from '../../components/common/Modal';
import { UserCheck, Plus, Shield, Layers, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export const TeamLeadsPage = () => {
  const { domains } = useDomains();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Lead form state
  const [name, setName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await getAllLeads();
      if (res.success) {
        setLeads(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDomainToggle = (domain) => {
    if (selectedDomains.includes(domain)) {
      setSelectedDomains(selectedDomains.filter((d) => d !== domain));
    } else {
      setSelectedDomains([...selectedDomains, domain]);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!name.trim()) {
      setFormError('Please enter the lead name.');
      return;
    }
    if (!accessCode.trim()) {
      setFormError('Please provide an access code for this lead.');
      return;
    }
    if (selectedDomains.length === 0) {
      setFormError('Please assign at least one domain to the team lead.');
      return;
    }

    setCreating(true);
    try {
      const res = await createLead({
        name: name.trim(),
        accessCode: accessCode.trim(),
        assignedDomains: selectedDomains
      });

      if (res.success) {
        setFormSuccess(`Team lead '${name}' successfully configured.`);
        setName('');
        setAccessCode('');
        setSelectedDomains([]);
        fetchLeads();
        setTimeout(() => {
          setIsModalOpen(false);
          setFormSuccess('');
        }, 1200);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create team lead.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#171717] tracking-tight">Team Leads Management</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Configure recruitment domain leads, assigned scopes, and access credentials
          </p>
        </div>
        <button
          onClick={() => {
            setFormError('');
            setFormSuccess('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full bg-[#171717] text-white hover:bg-[#262626] shadow-2xs transition-all self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-[#7AF1A7]" />
          Add Team Lead
        </button>
      </div>

      {/* Leads Directory Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-12 text-center shadow-ambient">
          <div className="w-8 h-8 border-2 border-[#E5E5E5] border-t-[#171717] rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#737373] font-medium">Loading leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-12 text-center text-xs text-[#737373] shadow-ambient">
          No team leads found. Click 'Add Team Lead' to configure one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <div
              key={lead._id}
              className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-ambient hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F0FDF4] border border-[#B8F7CF] text-[#166534] flex items-center justify-center font-bold text-sm">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#171717]">{lead.name}</h4>
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-[#166534] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7AF1A7]" />
                        Active Lead
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F4F4F4]">
                  <p className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider mb-2">
                    Assigned Domains ({lead.assignedDomains?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {lead.assignedDomains?.map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FAFAFA] text-[#171717] border border-[#E5E5E5]"
                      >
                        <Layers className="w-3 h-3 text-[#737373]" />
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F4F4F4] text-[11px] text-[#737373] flex items-center justify-between">
                <span>Created {new Date(lead.createdAt).toLocaleDateString()}</span>
                <span className="font-mono text-[10px] bg-[#FAFAFA] border border-[#E5E5E5] px-2 py-0.5 rounded-full text-[#525252]">
                  Protected Code
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Lead Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Team Lead Account"
      >
        <form onSubmit={handleCreateLead} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#B8F7CF] text-xs text-[#166534] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#7AF1A7]" />
              <span>{formSuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">Lead Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rohith - Cloud Lead"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#171717] text-[#171717] bg-[#FAFAFA]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">
              Private Access Code
            </label>
            <input
              type="text"
              required
              placeholder="e.g. LEAD_CLOUD_2025"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#171717] font-mono text-[#171717] bg-[#FAFAFA]"
            />
            <p className="mt-1 text-[11px] text-[#737373]">
              This code will be securely hashed with bcrypt on the server.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-2">
              Assign Scoped Domains
            </label>
            <div className="grid grid-cols-2 gap-2">
              {domains.map((dom) => {
                const isChecked = selectedDomains.includes(dom);
                return (
                  <button
                    key={dom}
                    type="button"
                    onClick={() => handleDomainToggle(dom)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-colors ${
                      isChecked
                        ? 'border-[#171717] bg-[#171717] text-white font-medium'
                        : 'border-[#E5E5E5] text-[#525252] hover:bg-[#F4F4F4] bg-[#FAFAFA]'
                    }`}
                  >
                    <span>{dom}</span>
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-[#7AF1A7]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#737373] hover:text-[#171717] hover:bg-[#F4F4F4] rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#171717] hover:bg-[#262626] disabled:opacity-50 rounded-full shadow-2xs transition-all"
            >
              {creating ? 'Saving...' : 'Create Team Lead'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
