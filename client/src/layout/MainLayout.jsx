import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

const MainLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-[#060606]">
      <Navbar />
      
      {/* Main Content */}
      <div className="flex-grow z-10 bg-[#060606] relative shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;
