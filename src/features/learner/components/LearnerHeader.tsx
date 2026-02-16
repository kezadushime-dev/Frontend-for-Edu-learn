import React from 'react';
import { Link } from 'react-router-dom';

export const LearnerHeader: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 gap-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {/* Placeholder for Omoskillo logo */}
            <span className="text-xl sm:text-2xl font-bold text-primary">Omoskillo</span>
          </Link>
          {/* Navigation Links */}
          <nav className="hidden md:flex gap-4">
            <Link to="#" className="text-gray-700 hover:text-primary transition-colors font-medium">Learning Paths</Link>
            <Link to="#" className="text-gray-700 hover:text-primary transition-colors font-medium">Create</Link>
            <Link to="#" className="text-gray-700 hover:text-primary transition-colors font-medium">Build</Link>
            <Link to="#" className="text-gray-700 hover:text-primary transition-colors font-medium">Thrive</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Icon */}
          <button className="p-2 rounded-full hover:bg-gray-100">
            <i data-lucide="search" className="w-5 h-5 text-gray-600"></i>
          </button>
          {/* Notification Icon */}
          <button className="p-2 rounded-full hover:bg-gray-100">
            <i data-lucide="bell" className="w-5 h-5 text-gray-600"></i>
          </button>
          {/* Become a teacher / My classes */}
          <div className="hidden sm:flex gap-2">
            <button className="px-3 py-1.5 rounded-md border border-gray-300 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary transition">Become a teacher</button>
            <button className="px-3 py-1.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-blue-700 transition">My classes</button>
          </div>
          {/* Profile Avatar Placeholder */}
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </nav>
  );
};