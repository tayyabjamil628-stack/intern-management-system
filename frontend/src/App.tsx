import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { InternsProvider } from './context/InternsContext';
import { ProjectsProvider } from './context/ProjectsContext';
import { InstructorsProvider } from './context/InstructorsContext';
import { CommunicationProvider } from './context/CommunicationContext';

export default function App() {
  return (
    <BrowserRouter>
      <InternsProvider>
        <ProjectsProvider>
          <InstructorsProvider>
            <CommunicationProvider>
              <AppRoutes />
            </CommunicationProvider>
          </InstructorsProvider>
        </ProjectsProvider>
      </InternsProvider>
    </BrowserRouter>
  );
}

