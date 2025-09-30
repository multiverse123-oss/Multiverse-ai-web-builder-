// frontend/src/components/Analytics/ProjectAnalytics.tsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Users, Activity, Zap } from 'lucide-react';

export const ProjectAnalytics: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Project Analytics</h3>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 rounded-lg text-sm ${
                timeframe === period
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics?.totalActivities || 0}</p>
              <p className="text-sm text-gray-600">Total Activities</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Object.keys(analytics?.userEngagement || {}).length}</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Math.max(...Object.values(analytics?.popularActions || {})) || 0}
              </p>
              <p className="text-sm text-gray-600">Most Common Action</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{timeframe}</p>
              <p className="text-sm text-gray-600">Time Period</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Over Time */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h4 className="text-lg font-semibold mb-4">Activity Over Time</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(analytics?.activityByDay || {}).map(([date, count]) => ({ date, count }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Action Distribution */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h4 className="text-lg font-semibold mb-4">Action Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(analytics?.popularActions || {}).map(([name, value], index) => ({
                  name,
                  value,
                  color: COLORS[index % COLORS.length]
                }))}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {Object.entries(analytics?.popularActions || {}).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h4 className="text-lg font-semibold mb-4">Recent Activity</h4>
        <div className="space-y-3">
          {analytics?.recentActivities?.map((activity: any) => (
            <div key={activity.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm font-semibold">
                  {activity.user.name?.charAt(0) || activity.user.email.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user.name || 'User'}</span>
                  {' '}{activity.action} {activity.targetType}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
