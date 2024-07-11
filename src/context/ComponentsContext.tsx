import { createContext, ReactNode } from 'react';
import * as OBC from "@thatopen/components";


export const ComponentsContext = createContext<OBC.Components | null>(null);


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