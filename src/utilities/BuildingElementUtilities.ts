
export interface buildingElement {
    expressID: number;
    GlobalID: string;
    type: number;
    name: string;
    modelID: string; // the fraggroup id
    properties: {name: string, value: string}[]
}

export interface SelectionGroup {
  groupType: GroupingType;
    groupName: string;
    elements: buildingElement[];
}

export type GroupingType = "Station" | "BuildingStep" | "Assembly" | "Unknown";

export function GetNextGroup(current: SelectionGroup | undefined, groups: Map<string, Map<string, buildingElement[]>>): SelectionGroup | undefined {
  if (!groups) return undefined;

  // If no current group, return the first station group
  if (!current) {
    const stations = groups.get("Station");
    if (!stations || stations.size === 0) return undefined;
    
    const [firstStationName, firstStationElements] = stations.entries().next().value;
    return { groupType: "Station", groupName: firstStationName, elements: firstStationElements };
  }

  const groupType = groups.get(current.groupType);
  if (!groupType) {
    console.log("Get next group failed. grouping type not found", current.groupType);
    return undefined;
  }

  // Convert keys to array for easier manipulation
  const groupKeys = Array.from(groupType.keys());
  const currentIndex = groupKeys.indexOf(current.groupName);
  
  // If current group not found or it's the last group, cycle to the first group
  const nextIndex = (currentIndex === -1 || currentIndex === groupKeys.length - 1) ? 0 : currentIndex + 1;
  const nextGroupKey = groupKeys[nextIndex];

  const elements = groupType.get(nextGroupKey);
  if (elements) {
    return { groupType: current.groupType, groupName: nextGroupKey, elements };
  }

  return undefined;
}

export function GetAdjacentGroup(
  current: SelectionGroup | undefined,
  groups: Map<string, Map<string, buildingElement[]>>,
  direction: 'next' | 'previous' = 'next'
): SelectionGroup | undefined {
  if (!groups) return undefined;

  // If no current group, return the first or last station group based on direction
  if (!current) {
    const stations = groups.get("Station");
    if (!stations || stations.size === 0) return undefined;
    
    const stationEntries = Array.from(stations.entries());
    const [stationName, stationElements] = direction === 'next' ? stationEntries[0] : stationEntries[stationEntries.length - 1];
    return { groupType: "Station", groupName: stationName, elements: stationElements };
  }

  const groupType = groups.get(current.groupType);
  if (!groupType) {
    console.log("Get adjacent group failed. grouping type not found", current.groupType);
    return undefined;
  }

  const groupKeys = Array.from(groupType.keys());
  const currentIndex = groupKeys.indexOf(current.groupName);
  
  let adjacentIndex: number;
  if (direction === 'next') {
    adjacentIndex = (currentIndex === -1 || currentIndex === groupKeys.length - 1) ? 0 : currentIndex + 1;
  } else {
    adjacentIndex = (currentIndex === -1 || currentIndex === 0) ? groupKeys.length - 1 : currentIndex - 1;
  }
  
  const adjacentGroupKey = groupKeys[adjacentIndex];
  const elements = groupType.get(adjacentGroupKey);

  if (elements) {
    return { groupType: current.groupType, groupName: adjacentGroupKey, elements };
  }

  return undefined;
}

export const setUpGroup = (elements: buildingElement[]) => {
  // make the groups and then pack them together
  let stations = groupElements(elements,"Station")
  let steps = groupElements(elements,"BuildingStep")
  const groupMap = new Map<string,Map<string,buildingElement[]>>();
  groupMap.set("Station",stations);
  groupMap.set("BuildingStep",steps); 
  return groupMap;
  } 

export const groupElements = (buildingElements: buildingElement[],groupType: GroupingType) : Map<string,buildingElement[]> => {
    if(buildingElements)
    {
      return buildingElements.reduce((acc, element) => {
        const propertyName = element.properties.find(prop => prop.name === groupType)?.value || 'Unknown'; 
        if(propertyName === 'Unknown')
          return acc;
        if (!acc.has(propertyName)) {
          acc.set(propertyName, []);
        }
        acc.get(propertyName)!.push(element);
        return acc;
      }, new Map<string, buildingElement[]>());
    }
    return new Map<string, buildingElement[]>();
  };

  const isGroupingType = (value: any): value is GroupingType => {
    return ["Station", "BuildingStep", "Assembly", "Unknown"].includes(value);
  };