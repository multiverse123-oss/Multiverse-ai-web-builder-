// frontend/src/pages/Dashboard/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Github, ExternalLink, Calendar } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import CreateProjectModal from './CreateProjectModal.tsx';
import ProjectGrid from './ProjectGrid.tsx';

const Dashboard: React.FC = () => {
  const { projects, loading, fetchProjects, createProject } = useProject();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (name: string, description: string) => {
    await createProject(name, description);
    // The ProjectProvider should update the state, triggering a re-render
    // If not, we might need to call fetchProjects() again.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              My Projects
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your AI-generated web applications and create new ones.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-6 py-3 rounded-full font-semibold flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="text-2xl font-bold text-gray-800">{projects.length}</div>
            <div className="text-gray-600 text-sm">Total Projects</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="text-2xl font-bold text-green-600">
              {projects.filter(p => p.status === 'deployed').length}
            </div>
            <div className="text-gray-600 text-sm">Live Sites</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="text-2xl font-bold text-blue-600">
              {projects.filter(p => p.githubConnected).length}
            </div>
            <div className="text-gray-600 text-sm">GitHub Connected</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="text-2xl font-bold text-purple-600">
              {projects.filter(p => p.lastActive).length}
            </div>
            <div className="text-gray-600 text-sm">Active Today</div>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <ProjectGrid projects={projects} />
        )}

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateProject}
        />
      </div>
    </div>
  );
};

export default Dashboard;
