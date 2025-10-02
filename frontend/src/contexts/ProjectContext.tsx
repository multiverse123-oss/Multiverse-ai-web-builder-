// frontend/src/contexts/ProjectContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Add the MemberRole type with your other type definitions
export type MemberRole = 'VIEWER' | 'EDITOR' | 'ADMIN';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'building' | 'ready' | 'deployed' | 'error';
  githubConnected: boolean;
  githubUrl?: string;
  previewUrl?: string;
  lastActive?: string;
}

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description: string) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

// Fixed: Properly defined as a React Function Component
export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  // Fixed: Added proper state initialization with TypeScript generics
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fixed: Provided a basic implementation for fetchProjects
  const fetchProjects = async (): Promise<void> => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Fetching projects...');
      // Simulate API call
      // const response = await api.get('/projects');
      // setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fixed: Provided implementation and return value for createProject
  const createProject = async (name: string, description: string): Promise<Project> => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9), // Simple ID generation
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      githubConnected: false,
    };
    
    // Update state with the new project
    setProjects(prevProjects => [...prevProjects, newProject]);
    return newProject;
  };

  // Fixed: Provided implementation for deleteProject
  const deleteProject = async (id: string): Promise<void> => {
    setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
  };

  // Fixed: Properly structured the context value object
  const contextValue: ProjectContextType = {
    projects,
    loading,
    fetchProjects,
    createProject,
    deleteProject,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};
