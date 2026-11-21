import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Shield, UserCheck, Layers } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-[#E5E5E5] sticky top-0 z-30 flex items-center justify-between px-6 transition-all">
      {/* Brand Header */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 p-1.5 rounded-full bg-[#F4F4F4] border border-[#E5E5E5]">
          <span className="w-2 h-2 rounded-full bg-[#4285F4]"></span>
          <span className="w-2 h-2 rounded-full bg-[#EA4335]"></span>
          <span className="w-2 h-2 rounded-full bg-[#FBBC05]"></span>
          <span className="w-2 h-2 rounded-full bg-[#34A853]"></span>
        </div>
        <div className="h-4 w-px bg-[#E5E5E5]"></div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-[#171717] tracking-tight">GDGoC VJIT</span>
          <span className="text-xs text-[#525252] hidden sm:inline font-normal">Recruitment Portal</span>
        </div>
      </div>

      {/* User Status & Logout */}
      <div className="flex items-center space-x-4">
        {/* Role & Domain indicator */}
        <div className="hidden sm:flex items-center space-x-2">
          {isAdmin ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#171717] text-white shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7AF1A7]" />
              Organiser
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F0FDF4] text-[#166534] border border-[#B8F7CF]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7AF1A7]" />
                Team Lead
              </span>
              {user?.domains && user.domains.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F4F4F4] text-[#525252] border border-[#E5E5E5]">
                  <Layers className="w-3 h-3 text-[#525252]" />
                  {user.domains.join(', ')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-3 border-l border-[#E5E5E5]">
          <div className="text-right hidden md:block">
            <p className="text-xs font-semibold text-[#171717] leading-tight">{user?.name || 'User'}</p>
            <p className="text-[11px] text-[#737373] capitalize">{user?.role === 'admin' ? 'Organiser' : (user?.role || '')}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#525252] hover:text-[#171717] px-3.5 py-1.5 rounded-full bg-[#F4F4F4] hover:bg-[#E5E5E5] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-[#525252]" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
