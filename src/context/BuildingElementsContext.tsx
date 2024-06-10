import { createContext, ReactNode } from 'react';
import { buildingElement } from '../utilities/IfcUtilities';


export const BuildingElementsContext = createContext<buildingElement[] | null>(null);


interface BuildingElementsProviderProps {
    children: ReactNode;
    buildingElements: buildingElement[];
  }

export const BuildingElementsProvider = ({children, buildingElements} : BuildingElementsProviderProps) => {
    return (
        <BuildingElementsContext.Provider value={buildingElements}>
          {children}
        </BuildingElementsContext.Provider>
      );
}