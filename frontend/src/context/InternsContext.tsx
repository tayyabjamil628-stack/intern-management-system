import React, { createContext, useContext, useState } from 'react';
import { mockInternsList, mockDepartmentsList, InternRecord } from '../data/mockInternsData';

interface InternsContextType {
  interns: InternRecord[];
  departments: string[];
  addIntern: (record: InternRecord) => void;
  updateIntern: (record: InternRecord) => void;
  deleteIntern: (id: string) => void;
  getInternById: (id: string) => InternRecord | undefined;
}

const InternsContext = createContext<InternsContextType | undefined>(undefined);

export const InternsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [interns, setInterns] = useState<InternRecord[]>(mockInternsList);

  const addIntern = (record: InternRecord) => {
    setInterns((prev) => [record, ...prev]);
  };

  const updateIntern = (record: InternRecord) => {
    setInterns((prev) => prev.map((item) => (item.id === record.id ? record : item)));
  };

  const deleteIntern = (id: string) => {
    setInterns((prev) => prev.filter((item) => item.id !== id));
  };

  const getInternById = (id: string) => {
    return interns.find((item) => item.id === id || item.internId === id);
  };

  return (
    <InternsContext.Provider
      value={{
        interns,
        departments: mockDepartmentsList,
        addIntern,
        updateIntern,
        deleteIntern,
        getInternById,
      }}
    >
      {children}
    </InternsContext.Provider>
  );
};

export const useInterns = (): InternsContextType => {
  const context = useContext(InternsContext);
  if (!context) {
    throw new Error('useInterns must be used within an InternsProvider');
  }
  return context;
};
