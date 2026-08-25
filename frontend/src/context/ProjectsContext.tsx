import React, { createContext, useContext, useState } from 'react';
import { mockProjectsList, ProjectRecord } from '../data/mockProjectsData';

interface ProjectsContextType {
  projects: ProjectRecord[];
  addProject: (record: ProjectRecord) => void;
  updateProject: (record: ProjectRecord) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => ProjectRecord | undefined;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<ProjectRecord[]>(mockProjectsList);

  const addProject = (record: ProjectRecord) => {
    setProjects((prev) => [record, ...prev]);
  };

  const updateProject = (record: ProjectRecord) => {
    setProjects((prev) => prev.map((item) => (item.id === record.id ? record : item)));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((item) => item.id !== id || item.projectId !== id));
  };

  const getProjectById = (id: string) => {
    return projects.find((item) => item.id === id || item.projectId === id);
  };

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        addProject,
        updateProject,
        deleteProject,
        getProjectById,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = (): ProjectsContextType => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};
