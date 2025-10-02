// frontend/src/pages/Dashboard/ProjectGrid.tsx
import React from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'building' | 'ready' | 'deployed' | 'error';
  githubConnected: boolean;
  githubUrl?: string;
  previewUrl?: string;
}

interface ProjectGridProps {
  projects: Project[];
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects }) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No projects yet. Create your first project to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <div key={project.id} className="border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
          <p className="text-gray-600 mt-2 text-sm">{project.description}</p>
          <div className="mt-4 flex justify-between items-center">
            <span className={`px-2 py-1 text-xs rounded-full ${
              project.status === 'deployed' ? 'bg-green-100 text-green-800' :
              project.status === 'building' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {project.status}
            </span>
            <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
              Open →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectGrid;