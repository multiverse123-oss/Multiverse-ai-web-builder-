// frontend/src/components/Build/BuildProgress.tsx
import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Play, StopCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface BuildProgressProps {
  projectId: string;
}

export const BuildProgress: React.FC<BuildProgressProps> = ({ projectId }) => {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'success' | 'failed'>('idle');
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  
  const { messages, isConnected } = useWebSocket('ws://localhost:3001');

  useEffect(() => {
    const buildMessages = messages.filter(msg => msg.projectId === projectId);
    
    if (buildMessages.length > 0) {
      const latestMessage = buildMessages[buildMessages.length - 1];
      
      switch (latestMessage.type) {
        case 'build_progress':
          setCurrentProgress(latestMessage.progress);
          setBuildStatus('building');
          if (latestMessage.logs) {
            setBuildLogs(prev => [...prev, ...latestMessage.logs]);
          }
          break;
        case 'build_complete':
          setCurrentProgress(100);
          setBuildStatus(latestMessage.success ? 'success' : 'failed');
          break;
      }
    }
  }, [messages, projectId]);

  const startBuild = () => {
    // Trigger build through API
    setBuildStatus('building');
    setCurrentProgress(0);
    setBuildLogs([]);
  };

  const cancelBuild = () => {
    // Cancel build through API
    setBuildStatus('idle');
    setCurrentProgress(0);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Build Progress</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Building...</span>
          <span>{currentProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${currentProgress}%` }}
          />
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center space-x-2 mb-4">
        {buildStatus === 'building' && <Clock className="h-5 w-5 text-yellow-500 animate-spin" />}
        {buildStatus === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
        {buildStatus === 'failed' && <XCircle className="h-5 w-5 text-red-500" />}
        <span className="capitalize font-medium">{buildStatus}</span>
      </div>

      {/* Build Logs */}
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-48 overflow-y-auto">
        {buildLogs.map((log, index) => (
          <div key={index} className="whitespace-pre-wrap">{log}</div>
        ))}
        {buildLogs.length === 0 && (
          <div className="text-gray-500">Build logs will appear here...</div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mt-4">
        <button
          onClick={startBuild}
          disabled={buildStatus === 'building'}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Play className="h-4 w-4" />
          <span>Start Build</span>
        </button>
        
        <button
          onClick={cancelBuild}
          disabled={buildStatus !== 'building'}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <StopCircle className="h-4 w-4" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
};
