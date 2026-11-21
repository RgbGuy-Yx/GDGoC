import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#E5E5E5] shadow-xs space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] text-[#171717] border border-[#B8F7CF] flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6 text-[#15803d]" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#171717]">Page Not Found</h2>
          <p className="text-xs text-[#737373] mt-1.5 leading-relaxed">
            The requested page or resource could not be found in the recruitment management system.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full bg-[#171717] text-white hover:bg-black transition-all shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
