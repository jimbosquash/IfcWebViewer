import React, { createContext, useState, ReactNode } from 'react';
import { GroupingType } from '../utilities/BuildingElementUtilities';

export interface InfoPanelProps {
  moduleName: string;
  moduleFileName: string;
  groupType: GroupingType;
  groupName: string;
}

interface InfoPanelContextProps {
  data: InfoPanelProps;
  updateData: (newData: InfoPanelProps) => void;
}

export const InfoPanelContext = createContext<InfoPanelContextProps | undefined>(undefined);

export const InfoPanelDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<InfoPanelProps>({
    moduleFileName: "ModuleFile",
    moduleName: "MT01",
    groupType: "Station",
    groupName: "Floor"
  });

  const updateData = (newData: InfoPanelProps) => {
    setData(newData);
  };

  return (
    <InfoPanelContext.Provider value={{ data, updateData }}>
      {children}
    </InfoPanelContext.Provider>
  );
};