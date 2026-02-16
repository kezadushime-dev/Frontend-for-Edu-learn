import React from 'react';
import { LearnerHeader } from './LearnerHeader';
import { LearnerSidebar } from './LearnerSidebar';
import { LearnerRightSidebar } from './LearnerRightSidebar';

interface LearnerCourseLayoutProps {
  children: React.ReactNode;
}

export const LearnerCourseLayout: React.FC<LearnerCourseLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <LearnerSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <LearnerHeader />

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>

      <LearnerRightSidebar />
    </div>
  );
};
