// SidePanelContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the enum for side panel types
export enum SidePanelType {
  NONE = 'NONE',
  SETTINGS = 'SETTINGS',
  PROFILE = 'PROFILE',
  NOTIFICATIONS = 'NOTIFICATIONS',
  // Add more panel types as needed
}

interface TopBarContextType {
  sidePanelType: SidePanelType;
  isSidePanelVisible: boolean;
  isAssemblyBrowserVisible: boolean;
  isPropertiesPanelVisible: boolean;
  toggleSidePanel: (type: SidePanelType | boolean) => void;
  toggleAssemblyBrowserPanel: (isVisble: boolean | undefined) => void;
  togglePropertiesPanel: (isVisble: boolean | undefined) => void;
}

// Create the context
const TopBarContext = createContext<TopBarContextType | undefined>(undefined);

interface SidePanelProviderProps {
  children: ReactNode;
}

export const TopBarContextProvider: React.FC<SidePanelProviderProps> = ({ children }) => {
  const [sidePanelType, setSidePanelType] = useState<SidePanelType>(SidePanelType.SETTINGS);
  const [isSidePanelVisible, setIsSidePanelVisible] = useState<boolean>(false);
  const [isAssemblyBrowserVisible, setIsAssemblyBrowserVisible] = useState<boolean>(false);
  const [isPropertiesPanelVisible, setIsPropertiesPanelVisible] = useState<boolean>(false);

  const togglePropertiesPanel = (isVisible: boolean | undefined = undefined): void => {
    if(isVisible === undefined) setIsPropertiesPanelVisible(!isPropertiesPanelVisible)
    else if((isPropertiesPanelVisible && !isVisible) || (!isPropertiesPanelVisible && isVisible))
    setIsPropertiesPanelVisible(isPropertiesPanelVisible)
  }


    const toggleAssemblyBrowserPanel = (isVisible: boolean | undefined = undefined): void => {
    if(isVisible === undefined) setIsAssemblyBrowserVisible(!isAssemblyBrowserVisible)
    else if((isAssemblyBrowserVisible && !isVisible) || (!isAssemblyBrowserVisible && isVisible))
        setIsAssemblyBrowserVisible(isVisible)
  }


    const toggleSidePanel = (type: SidePanelType | boolean): void => {
    if(type == true && isSidePanelVisible || type == false && !isSidePanelVisible) return;
    
    if(type == true || type == false){
        setIsSidePanelVisible(type);
        return;
    }
    
    if (sidePanelType === type && isSidePanelVisible) {
        setIsSidePanelVisible(false);
      setSidePanelType(SidePanelType.NONE);
    } else {
        setIsSidePanelVisible(true);
      setSidePanelType(type);
    }
  };

  const contextValue: TopBarContextType = {
    sidePanelType,
    isSidePanelVisible,
    isAssemblyBrowserVisible,
    isPropertiesPanelVisible,
    toggleSidePanel,
    toggleAssemblyBrowserPanel,
    togglePropertiesPanel
  };

  return (
    <TopBarContext.Provider value={contextValue}>
      {children}
    </TopBarContext.Provider>
  );
};

// Custom hook for using the context
export const useTopBarContext = (): TopBarContextType => {
  const context = useContext(TopBarContext);
  if (!context) {
    throw new Error('useSidePanel must be used within a SidePanelProvider');
  }
  return context;
};

export default TopBarContextProvider;