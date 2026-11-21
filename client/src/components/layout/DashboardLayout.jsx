import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { Sidebar } from '../common/Sidebar';

export const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
      <Navbar
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={mobileMenuOpen}
      />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 bg-gradient-to-b from-[#F0FDF4]/35 via-[#FAFAFA] to-[#FAFAFA]">
          <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
