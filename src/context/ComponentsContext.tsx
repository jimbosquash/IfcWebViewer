import { createContext, ReactNode, useContext } from 'react';
import * as OBC from "@thatopen/components";


const ComponentsContext = createContext<OBC.Components | null>(null);


interface ComponentsProviderProps {
    children: ReactNode;
    components: OBC.Components;
  }

export const ComponentsProvider = ({children, components} : ComponentsProviderProps) => {
    return (
        <ComponentsContext.Provider value={components}>
          {children}
        </ComponentsContext.Provider>
      );
}

// Custom hook for using the context
export const useComponentsContext = (): OBC.Components => {
  const context = useContext(ComponentsContext);
  if (!context) {
    console.log('useComponentsContext must be used within a ComponentsContextProvider');
  }
  return context;
};