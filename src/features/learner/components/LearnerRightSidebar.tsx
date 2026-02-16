import React from 'react';
import { Link } from 'react-router-dom';

export const LearnerRightSidebar: React.FC = () => {
  return (
    <div className="w-80 bg-white shadow-md h-full p-4 flex flex-col">
      {/* Share Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Share</h3>
        <div className="flex gap-3">
          {/* Placeholder for social share icons */}
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
            <i data-lucide="share-2" className="w-5 h-5 text-gray-600"></i>
          </button>
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
            <i data-lucide="facebook" className="w-5 h-5 text-gray-600"></i>
          </button>
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
            <i data-lucide="twitter" className="w-5 h-5 text-gray-600"></i>
          </button>
        </div>
      </div>

      {/* Course Completion */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Course Completion</h3>
        <p className="text-sm text-gray-600 mb-2">35% complete (1/15)</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div className="bg-primary h-2.5 rounded-full" style={{ width: '35%' }}></div>
        </div>
        {/* Course Modules/Lessons */}
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">01</span>
            <div>
              <p className="font-medium">Introduction to project management</p>
              <div className="text-xs text-gray-500 flex justify-between">
                <span>01:41</span>
                <span>04:50</span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs">02</span>
            <div>
              <p className="font-medium">Start learning with basics</p>
              <div className="text-xs text-gray-500 flex justify-between">
                <span>02:20</span>
                <span>06:50</span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs">03</span>
            <div>
              <p className="font-medium">How to manage times and Priority</p>
              <div className="text-xs text-gray-500 flex justify-between">
                <span>00:00</span>
                <span>11:40</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended courses */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Recommended courses</h3>
        <div className="space-y-4">
          <Link to="#" className="flex items-center gap-3 bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition">
            <div className="w-12 h-12 bg-purple-200 rounded-lg flex-shrink-0"></div>
            <div>
              <p className="font-medium">Build Dynamic UI for Websites</p>
              <p className="text-sm text-gray-600">$256</p>
            </div>
          </Link>
          <Link to="#" className="flex items-center gap-3 bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition">
            <div className="w-12 h-12 bg-pink-200 rounded-lg flex-shrink-0"></div>
            <div>
              <p className="font-medium">Create Designs and Prototypes</p>
              <p className="text-sm text-gray-600">Free</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
