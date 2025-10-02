// frontend/src/components/Analytics/ProjectAnalytics.tsx
import React from 'react';

const ProjectAnalytics: React.FC<{ projectId: string }> = ({ projectId }) => {
  // Simplified version without Recharts for now to fix build
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Project Analytics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 font-bold">📊</span>
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-600">Total Activities</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 font-bold">👥</span>
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 font-bold">⚡</span>
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-600">Most Common Action</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-orange-600 font-bold">📅</span>
            </div>
            <div>
              <p className="text-2xl font-bold">30d</p>
              <p className="text-sm text-gray-600">Time Period</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h4 className="text-lg font-semibold mb-4">Analytics Coming Soon</h4>
        <p className="text-gray-600">
          Advanced analytics with charts and graphs will be implemented once the basic build is working.
        </p>
      </div>
    </div>
  );
};

export default ProjectAnalytics;
