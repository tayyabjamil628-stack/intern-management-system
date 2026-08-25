import React, { createContext, useContext, useState } from 'react';
import { mockInstructorsList, InstructorRecord } from '../data/mockInstructorsData';

interface InstructorsContextType {
  instructors: InstructorRecord[];
  addInstructor: (record: InstructorRecord) => void;
  updateInstructor: (record: InstructorRecord) => void;
  deleteInstructor: (id: string) => void;
  getInstructorById: (id: string) => InstructorRecord | undefined;
}

const InstructorsContext = createContext<InstructorsContextType | undefined>(undefined);

export const InstructorsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [instructors, setInstructors] = useState<InstructorRecord[]>(mockInstructorsList);

  const addInstructor = (record: InstructorRecord) => {
    setInstructors((prev) => [record, ...prev]);
  };

  const updateInstructor = (record: InstructorRecord) => {
    setInstructors((prev) => prev.map((item) => (item.id === record.id ? record : item)));
  };

  const deleteInstructor = (id: string) => {
    setInstructors((prev) => prev.filter((item) => item.id !== id || item.instructorId !== id));
  };

  const getInstructorById = (id: string) => {
    return instructors.find((item) => item.id === id || item.instructorId === id);
  };

  return (
    <InstructorsContext.Provider
      value={{
        instructors,
        addInstructor,
        updateInstructor,
        deleteInstructor,
        getInstructorById,
      }}
    >
      {children}
    </InstructorsContext.Provider>
  );
};

export const useInstructors = (): InstructorsContextType => {
  const context = useContext(InstructorsContext);
  if (!context) {
    throw new Error('useInstructors must be used within an InstructorsProvider');
  }
  return context;
};
