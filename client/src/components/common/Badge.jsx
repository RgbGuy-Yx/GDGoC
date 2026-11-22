import React from 'react';

export const ShortlistBadge = ({ status }) => {
  const normalized = (status || 'PENDING').toUpperCase();

  const config = {
    SHORTLISTED: {
      label: 'Shortlisted',
      className: 'bg-[#E6F4EA] text-[#137333] border-[#34A853]',
      dot: 'bg-[#34A853]'
    },
    WAITLISTED: {
      label: 'Waitlisted',
      className: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
      dot: 'bg-[#F59E0B]'
    },
    PENDING: {
      label: 'Pending',
      className: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
      dot: 'bg-[#F59E0B]'
    },
    IN_REVIEW: {
      label: 'In Review',
      className: 'bg-[#F4F4F4] text-[#171717] border-[#E5E5E5]',
      dot: 'bg-[#737373]'
    },
    REJECTED: {
      label: 'Not Shortlisted',
      className: 'bg-[#FAFAFA] text-[#737373] border-[#E5E5E5]',
      dot: 'bg-[#A3A3A3]'
    }
  };

  const current = config[normalized] || config.PENDING;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${current.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
};

export const FinalStatusBadge = ({ status }) => {
  const normalized = (status || 'PENDING').toUpperCase();

  const config = {
    SELECTED: {
      label: 'Selected',
      className: 'bg-[#1a73e8] text-white border-[#1a73e8]',
      dot: 'bg-[#34A853]'
    },
    PENDING: {
      label: 'Pending Decision',
      className: 'bg-[#F4F4F4] text-[#525252] border-[#E5E5E5]',
      dot: 'bg-[#A3A3A3]'
    },
    WAITLISTED: {
      label: 'Waitlisted',
      className: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
      dot: 'bg-[#F59E0B]'
    },
    REJECTED: {
      label: 'Rejected',
      className: 'bg-[#FAFAFA] text-[#737373] border-[#E5E5E5]',
      dot: 'bg-[#A3A3A3]'
    }
  };

  const current = config[normalized] || config.PENDING;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${current.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
};

export const DomainBadge = ({ domain }) => {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F4F4F4] text-[#171717] border border-[#E5E5E5]">
      {domain || 'General'}
    </span>
  );
};

export const YearBadge = ({ year }) => {
  const y = String(year || '').trim();
  let color = 'bg-[#F4F4F4] text-[#525252] border-[#E5E5E5]';
  let dotColor = 'bg-[#737373]';
  let label = y || 'N/A';

  if (/^1/i.test(y)) {
    color = 'bg-blue-50/80 text-blue-800 border-blue-200/90 font-medium';
    dotColor = 'bg-blue-500';
    label = '1st Year';
  } else if (/^2/i.test(y)) {
    color = 'bg-purple-50/80 text-purple-800 border-purple-200/90 font-medium';
    dotColor = 'bg-purple-500';
    label = '2nd Year';
  } else if (/^3/i.test(y)) {
    color = 'bg-amber-50/80 text-amber-800 border-amber-200/90 font-medium';
    dotColor = 'bg-amber-500';
    label = '3rd Year';
  } else if (/^4/i.test(y)) {
    color = 'bg-emerald-50/80 text-emerald-800 border-emerald-200/90 font-medium';
    dotColor = 'bg-emerald-500';
    label = '4th Year';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] border ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
};
