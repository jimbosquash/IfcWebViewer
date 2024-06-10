import React, { createContext, useRef, ReactNode, MutableRefObject } from 'react';

export const RefContext = createContext<MutableRefObject<HTMLElement | null> | null>(null);

interface RefProviderProps {
  children: ReactNode;
  containerRef: any;
}

export const RefProvider: React.FC<RefProviderProps> = ({ children, containerRef }) => {
  // const containerRef = useRef<HTMLElement | null>(null);
  // console.log('useRef provider', containerRef)
  return (
    <RefContext.Provider value={containerRef}>
      {children}
    </RefContext.Provider>
  );
};
