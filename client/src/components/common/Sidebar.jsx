import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Layers,
  UserCheck,
  Award,
  ArrowRightLeft,
  CheckCircle2,
  FileSpreadsheet,
  XCircle,
  ArrowDownLeft,
  ArrowUpRight,
  LogOut,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpenMobile, onCloseMobile }) => {
  const { user, isAdmin, logout } = useAuth();

  const adminNavItems = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/candidates', label: 'All Candidates', icon: Users },
    { to: '/admin/domains', label: 'Domain-wise', icon: Layers },
    { to: '/admin/leads', label: 'Team Leads', icon: UserCheck },
    { to: '/admin/evaluations', label: 'Evaluations', icon: Award },
    { to: '/admin/transfers', label: 'Transfers', icon: ArrowRightLeft },
    { to: '/admin/final-results', label: 'Shortlisted by Leads', icon: CheckCircle2 },
    { to: '/admin/import', label: 'Import Spreadsheet', icon: FileSpreadsheet },
  ];

  const leadNavItems = [
    { to: '/lead', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/lead/candidates', label: 'My Candidates', icon: Users },
    { to: '/lead/shortlisted', label: 'Shortlisted', icon: CheckCircle2 },
    { to: '/lead/not-shortlisted', label: 'Pending / Not Shortlisted', icon: XCircle },
    { to: '/lead/transferred-to-me', label: 'Transferred to Me', icon: ArrowDownLeft },
    { to: '/lead/transferred-by-me', label: 'Transferred by Me', icon: ArrowUpRight },
  ];

  const navItems = isAdmin ? adminNavItems : leadNavItems;

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 top-16 bg-[#171717]/40 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar: Slide-over drawer on mobile (< md), static left rail on desktop (md+) */}
      <aside
        className={`
          fixed md:static top-16 left-0 bottom-0 z-50 w-72 md:w-64 bg-white border-r border-[#E5E5E5] flex flex-col shrink-0
          transition-transform duration-200 ease-in-out md:translate-x-0
          ${isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:flex'}
          ${!isOpenMobile ? 'hidden md:flex' : ''}
          min-h-[calc(100vh-4rem)]
        `}
      >
        {/* Mobile Header in Drawer */}
        <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7AF1A7]" />
            <span className="text-xs font-semibold text-[#171717]">
              {isAdmin ? 'Organiser Console' : user?.name || 'Lead Workspace'}
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-[#F4F4F4]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 sm:p-4 flex-1 overflow-y-auto">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
            {isAdmin ? 'Organisers Portal' : 'Lead Workspace'}
          </p>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#171717] text-white shadow-2xs font-semibold'
                        : 'text-[#525252] hover:text-[#171717] hover:bg-[#F4F4F4]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#737373]'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7AF1A7]" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-3.5 sm:p-4 border-t border-[#E5E5E5]">
          <button
            onClick={() => {
              handleLinkClick();
              logout();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#525252] hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-[#737373]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
