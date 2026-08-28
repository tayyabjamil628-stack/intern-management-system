import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { InternsProvider } from './context/InternsContext';
import { ProjectsProvider } from './context/ProjectsContext';
import { InstructorsProvider } from './context/InstructorsContext';
import { CommunicationProvider } from './context/CommunicationContext';

// import.meta.env.BASE_URL reflects Vite's `base` config: '/' locally,
// '/intern-management-system/' when built for GitHub Pages. Stripping the
// trailing slash gives BrowserRouter the basename it expects ('' locally).
const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function App() {
  return (
    <BrowserRouter basename={routerBasename}>
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