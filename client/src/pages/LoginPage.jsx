import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, ShieldAlert, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const [accessCode, setAccessCode] = useState('');
  const [roleMode, setRoleMode] = useState('lead'); // 'lead', 'admin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      setError('Please enter your access code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const user = await login(accessCode.trim(), roleMode);
      const destination = user.role === 'admin' ? '/admin' : '/lead';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid access code. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0FDF4] via-white to-[#FAFAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Pill with Mint Accent */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E5E5] shadow-2xs mb-5">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#4285F4]"></span>
            <span className="w-2 h-2 rounded-full bg-[#EA4335]"></span>
            <span className="w-2 h-2 rounded-full bg-[#FBBC05]"></span>
            <span className="w-2 h-2 rounded-full bg-[#34A853]"></span>
          </div>
          <span className="h-3 w-px bg-[#E5E5E5]"></span>
          <span className="text-xs font-semibold text-[#171717]">GDGoC VJIT</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#7AF1A7]" />
        </div>

        <h2 className="text-3xl font-semibold tracking-tight text-[#171717]">
          Recruitment Portal
        </h2>
        <p className="mt-2 text-xs text-[#737373] max-w-xs mx-auto">
          Private console for GDGoC organisers and domain evaluation team leads
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E5E5E5] shadow-card">
          {/* Segmented Mode Switcher */}
          <div className="flex rounded-full bg-[#F4F4F4] p-1 mb-6 text-xs font-medium text-[#737373] border border-[#E5E5E5]">
            <button
              type="button"
              onClick={() => { setRoleMode('lead'); setError(''); }}
              className={`flex-1 py-1.5 rounded-full transition-all ${
                roleMode === 'lead' ? 'bg-white text-[#171717] shadow-2xs font-semibold' : 'hover:text-[#171717]'
              }`}
            >
              Team Lead
            </button>
            <button
              type="button"
              onClick={() => { setRoleMode('admin'); setError(''); }}
              className={`flex-1 py-1.5 rounded-full transition-all ${
                roleMode === 'admin' ? 'bg-white text-[#171717] shadow-2xs font-semibold' : 'hover:text-[#171717]'
              }`}
            >
              Organiser
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-700">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="accessCode" className="block text-xs font-semibold text-[#171717] mb-1.5">
                Access Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A3A3A3]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="accessCode"
                  name="accessCode"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter your security access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 text-xs border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#171717] text-[#171717] bg-[#FAFAFA] placeholder-[#A3A3A3] transition-all"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-[#737373]">
                {roleMode === 'admin'
                  ? 'Enter your organiser secret access code.'
                  : 'Enter your assigned domain lead access code.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#171717] hover:bg-[#262626] text-white text-xs font-semibold shadow-2xs active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Discreet footer notice */}
          <div className="mt-6 pt-5 border-t border-[#F4F4F4] text-center">
            <p className="text-[11px] text-[#A3A3A3] flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-[#A3A3A3]" />
              Authorized personnel only · Credentials managed by core team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
