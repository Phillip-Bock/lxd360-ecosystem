'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import NewCourseModal from '@/components/dashboard/new-course-modal';

interface NewCourseModalContextType {
  openNewCourseModal: () => void;
  closeNewCourseModal: () => void;
  isOpen: boolean;
}

const NewCourseModalContext = createContext<NewCourseModalContextType | null>(null);

export function useNewCourseModal() {
  const context = useContext(NewCourseModalContext);
  if (!context) {
    throw new Error('useNewCourseModal must be used within NewCourseModalProvider');
  }
  return context;
}

export function NewCourseModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openNewCourseModal = useCallback(() => setIsOpen(true), []);
  const closeNewCourseModal = useCallback(() => setIsOpen(false), []);

  return (
    <NewCourseModalContext.Provider value={{ openNewCourseModal, closeNewCourseModal, isOpen }}>
      {children}
      <NewCourseModal isOpen={isOpen} onClose={closeNewCourseModal} />
    </NewCourseModalContext.Provider>
  );
}
