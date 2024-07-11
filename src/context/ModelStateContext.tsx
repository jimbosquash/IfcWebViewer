import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import * as OBC from "@thatopen/components";
import { buildingElement, SelectionGroup } from '../utilities/BuildingElementUtilities';
import * as FRAGS from "@thatopen/fragments";
import * as OBF from "@thatopen/components-front"


interface ModelStateContextType {
  buildingElements: buildingElement[];
  currentModel: FRAGS.FragmentsGroup;
  selectedGroup: SelectionGroup | undefined;
  groups:  Map<string, Map<string,buildingElement[]>>;
  groupVisibility: Map<string,boolean>;
  currentWorld: OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer> | undefined,
  setGroupVisibility: (visibilityMap: Map<string,boolean>) => void;
  setBuildingElements: (elements: buildingElement[]) => void;
  setCurrentModel: (model: FRAGS.FragmentsGroup) => void;
  setSelectedGroup: (group: SelectionGroup | undefined) => void;
  setGroups: (groups: Map<string, Map<string,buildingElement[]>>) => void;
  setWorld: (world: OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer> | undefined) => void;
}

export function useModelContext() {
  const context = useContext(ModelStateContext);
  if(context === undefined) {
    throw new Error('useContext must be used within a context provider')
  }
  return context;
} 

const ModelStateContext = createContext<ModelStateContextType | undefined>(undefined);

interface ModelStateProviderProps {
  children: ReactNode;
  elements: buildingElement[];
  currentModel: FRAGS.FragmentsGroup;
  selectedGroup: SelectionGroup | undefined;
  groups:  Map<string, Map<string,buildingElement[]>>;
  groupVisibility: Map<string,boolean>;
  currentWorld: OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer> | undefined;
}

export const ModelStateProvider = ({ children, elements, currentModel, selectedGroup, groups }: ModelStateProviderProps) => {
  const [buildingElements, setBuildingElements] = useState<buildingElement[]>(elements);
  const [model, setCurrentModel] = useState<FRAGS.FragmentsGroup>(currentModel);
  const [group, setSelectedGroup] = useState<SelectionGroup | undefined>(selectedGroup);
  const [allGroups, setGroups] = useState<Map<string, Map<string,buildingElement[]>>>(groups);
  const [groupVisibility, setGroupVisibility] = useState<Map<string,boolean>>(new Map<string,boolean>);
  const [world, setWorld] = useState<OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer> | undefined>();

  useEffect(() => {
    console.log("ModelState: world changed", world);
  }, [world]);

  return (
    <ModelStateContext.Provider value={{
      buildingElements,
      currentModel: model,
      selectedGroup: group,
      groups: allGroups,
      groupVisibility: groupVisibility,
      currentWorld: world,
      setGroupVisibility,
      setBuildingElements,
      setCurrentModel,
      setSelectedGroup,
      setGroups,
      setWorld
    }}>
      {children}
    </ModelStateContext.Provider>
  );
};