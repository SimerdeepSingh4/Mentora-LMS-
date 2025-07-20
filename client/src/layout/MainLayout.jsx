import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Main Content */}
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
