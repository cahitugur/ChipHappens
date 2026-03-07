'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface SelectGroupModalContextValue {
  openSelectGroupModal: boolean;
  setOpenSelectGroupModal: (open: boolean) => void;
}

const SelectGroupModalContext = createContext<SelectGroupModalContextValue | undefined>(undefined);

export function SelectGroupModalProvider({ children }: { children: ReactNode }) {
  const [openSelectGroupModal, setOpenSelectGroupModal] = useState(false);
  const setter = useCallback((open: boolean) => setOpenSelectGroupModal(open), []);
  return (
    <SelectGroupModalContext.Provider
      value={{ openSelectGroupModal, setOpenSelectGroupModal: setter }}
    >
      {children}
    </SelectGroupModalContext.Provider>
  );
}

export function useSelectGroupModal(): SelectGroupModalContextValue {
  const ctx = useContext(SelectGroupModalContext);
  if (ctx === undefined) throw new Error('useSelectGroupModal must be used within SelectGroupModalProvider');
  return ctx;
}
