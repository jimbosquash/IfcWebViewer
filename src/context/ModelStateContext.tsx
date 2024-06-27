import { createContext, ReactNode, useEffect, useState } from 'react';
import { buildingElement, GroupingType, SelectionGroup } from '../utilities/BuildingElementUtilities';
import * as FRAGS from "@thatopen/fragments";

interface ModelStateContextType {
  buildingElements: buildingElement[];
  currentModel: FRAGS.FragmentsGroup;
  selectedGroup: SelectionGroup | undefined;
  groups:  Map<string, Map<string,buildingElement[]>>;
  groupVisibility: Map<string,boolean>;
  setGroupVisibility: (visibilityMap: Map<string,boolean>) => void;
  setBuildingElements: (elements: buildingElement[]) => void;
  setCurrentModel: (model: FRAGS.FragmentsGroup) => void;
  setSelectedGroup: (group: SelectionGroup | undefined) => void;
  setGroups: (groups: Map<string, Map<string,buildingElement[]>>) => void;
}


export const ModelStateContext = createContext<ModelStateContextType | null>(null);

interface ModelStateProviderProps {
  children: ReactNode;
  elements: buildingElement[];
  currentModel: FRAGS.FragmentsGroup;
  selectedGroup: SelectionGroup | undefined;
  groups:  Map<string, Map<string,buildingElement[]>>;
  groupVisibility: Map<string,boolean>;
}

export const ModelStateProvider = ({ children, elements, currentModel, selectedGroup, groups }: ModelStateProviderProps) => {
  const [buildingElements, setBuildingElements] = useState<buildingElement[]>(elements);
  const [model, setCurrentModel] = useState<FRAGS.FragmentsGroup>(currentModel);
  const [group, setSelectedGroup] = useState<SelectionGroup | undefined>(selectedGroup);
  const [allGroups, setGroups] = useState<Map<string, Map<string,buildingElement[]>>>(groups);
  const [groupVisibility, setGroupVisibility] = useState<Map<string,boolean>>(new Map<string,boolean>);

  useEffect(() => {
    console.log("ModelState: group changed", group);
  }, [group]);

  useEffect(() => {
    console.log("ModelState: groupVisibility changed", groupVisibility);
  }, [groupVisibility]);

  useEffect(() => {
    console.log("ModelState: groups changed", allGroups);
  }, [allGroups]);

  // useEffect(() => {
  //   console.log("ModelState: model changed", model);
  // }, [model]);

  // useEffect(() => {
  //   console.log("ModelState: buildingElements changed", buildingElements);
  // }, [buildingElements]);

  return (
    <ModelStateContext.Provider value={{
      buildingElements,
      currentModel: model,
      selectedGroup: group,
      groups: allGroups,
      groupVisibility: groupVisibility,
      setGroupVisibility,
      setBuildingElements,
      setCurrentModel,
      setSelectedGroup,
      setGroups
    }}>
      {children}
    </ModelStateContext.Provider>
  );
};