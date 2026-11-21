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
  LogOut
} from 'lucide-react';

export const Sidebar = () => {
  const { isAdmin, logout } = useAuth();

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

  return (
    <aside className="w-64 bg-white border-r border-[#E5E5E5] flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1">
        <p className="px-3 pb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
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

      <div className="p-4 border-t border-[#E5E5E5]">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#525252] hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4 text-[#737373]" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
