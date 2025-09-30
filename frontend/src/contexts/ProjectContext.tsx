// frontend/src/contexts/ProjectContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

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

export const ProjectProvider: ({ children }: ProjectProviderProps) => (
  <ProjectContext.Provider value={{
    projects: [],
    loading: false,
    fetchProjects: async () => {},
    createProject: async (name: string, description: string) => ({ /*...*/ }),
    deleteProject: async (id: string) => {}
  }}>
    {children}
  </ProjectContext.Provider>
);
