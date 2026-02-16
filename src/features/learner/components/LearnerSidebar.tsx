import React from 'react';
import { Link } from 'react-router-dom';

export const LearnerSidebar: React.FC = () => {
  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_14px_30px_-20px_rgba(15,23,42,0.5)] h-full flex flex-col">
      <div className="p-4 border-b">
        {/* Omoskillo Logo */}
        <Link to="/" className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold text-primary">Omoskillo</span>
        </Link>

        {/* User Profile Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div> {/* User Avatar */}
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800">ANDRIO RICHARD</span>
            <span className="text-sm text-slate-500">Student</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 grid gap-1.5 text-sm">
        <Link to="/dashboard-learner" className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-900">
          <i data-lucide="layout-dashboard" className="w-5 h-5"></i> Dashboard
        </Link>
        <Link to="/lesson" className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium transition-colors bg-blue-600 text-white shadow-sm">
          <i data-lucide="book" className="w-5 h-5"></i> My Courses
        </Link>
        <Link to="#" className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-900">
          <i data-lucide="save" className="w-5 h-5"></i> Save Classes
        </Link>
        <Link to="#" className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-900">
          <i data-lucide="clipboard-list" className="w-5 h-5"></i> Assignments
        </Link>
        <Link to="#" className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-900">
          <i data-lucide="award" className="w-5 h-5"></i> Test
        </Link>
        <Link to="#" className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-900">
          <i data-lucide="users" className="w-5 h-5"></i> Groups
        </Link>
        <Link to="#" className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-900">
          <i data-lucide="message-square" className="w-5 h-5"></i> Forum
        </Link>
      </nav>

      {/* Bottom section (Analytics, Setting, Log Out) */}
      <div className="p-4 border-t mt-auto">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600 mb-2">Account</h3>
        <ul className="grid gap-1.5 text-sm">
          <li className="px-3 py-2.5 hover:bg-slate-100 rounded-xl cursor-pointer">
            <Link to="#" className="flex items-center gap-2 text-slate-600">
              <i data-lucide="line-chart" className="w-5 h-5"></i> Analytics
            </Link>
          </li>
          <li className="px-3 py-2.5 hover:bg-slate-100 rounded-xl cursor-pointer">
            <Link to="#" className="flex items-center gap-2 text-slate-600">
              <i data-lucide="settings" className="w-5 h-5"></i> Setting
            </Link>
          </li>
          <li className="px-3 py-2.5 hover:bg-slate-100 rounded-xl cursor-pointer">
            <Link to="#" className="flex items-center gap-2 text-red-500">
              <i data-lucide="log-out" className="w-5 h-5"></i> Log Out
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
};
