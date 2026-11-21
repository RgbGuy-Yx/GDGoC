import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'mint' }) => {
  const iconTileStyles = {
    mint: 'bg-[#F0FDF4] text-[#166534] border-[#B8F7CF]',
    green: 'bg-[#F0FDF4] text-[#166534] border-[#B8F7CF]',
    blue: 'bg-[#F4F4F4] text-[#171717] border-[#E5E5E5]',
    amber: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
    red: 'bg-[#FAFAFA] text-[#737373] border-[#E5E5E5]',
    purple: 'bg-[#F4F4F4] text-[#171717] border-[#E5E5E5]',
    slate: 'bg-[#F4F4F4] text-[#171717] border-[#E5E5E5]'
  };

  const activeTile = iconTileStyles[color] || iconTileStyles.mint;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 shadow-ambient hover:border-slate-300 transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-[#171717] tracking-tight">{value ?? 0}</p>
          {subtitle && (
            <p className="text-xs text-[#737373]">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl border shrink-0 transition-transform group-hover:scale-105 ${activeTile}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
};
