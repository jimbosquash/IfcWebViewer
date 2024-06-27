
export interface buildingElement {
    expressID: number;
    GlobalID: string;
    type: number;
    name: string;
    properties: {name: string, value: string}[]
}

export interface SelectionGroup {
  groupType: GroupingType;
    groupName: string;
    elements: buildingElement[];
}

export type GroupingType = "Station" | "BuildingStep" | "Assembly" | "Unknown";

export function GetNextGroup(current: SelectionGroup | undefined, groups: Map<string, Map<string,buildingElement[]>>) : SelectionGroup | undefined {
  
  // console.log("groups", groups)
  if(!groups) return;

  if(!current)
  {
    const stations = groups.get("Station")//?.entries().next().value;
    // console.log("station map", stations)

    const firstStation = stations?.entries().next().value;
    console.log("first station map", firstStation)

      return {groupType: "Station",groupName: stations?.keys().next().value, elements: stations?.values().next().value }
    return;

  }

  let groupType = groups.get(current.groupType);
  if(!groupType)
  {
    console.log("Get next group failed. grouping type not found", current.groupType)
    return;
  }
  console.log("group types", groupType)
  console.log("current group", current)


  var nextGroupKey: string = "";
  let groupFound = false;
  // console.log("group Type", groupType)

  for(let key of groupType.keys())
  {
    console.log("grop key", key)
    if(groupFound)
      {
        nextGroupKey = key;
        break;
      }
    if(key === current.groupName)
      {
        groupFound = true;
      }
  }
  console.log("next group key", nextGroupKey)

  // groupType.forEach((value, key) => {
  //   console.log("entrie",value,key)
  //   // if(groupFound)
  //   //   {
  //   //     nextGroupKey = key;
  //   //     return;
  //   //   }
  //   // if(key === current.groupName)
  //   //   groupFound = true;
  // })

  // if not set but found, assume it is the last value in the last then go to first value
  if(nextGroupKey === "" && groupFound)
    {
      nextGroupKey = groupType.keys().next().value;
      console.log("last group key found, using first group key", nextGroupKey)

    }
  
  const elements = groupType.get(nextGroupKey);
  if(elements)
    {
      console.log('next group returned',nextGroupKey)
      return {groupType: current.groupType,groupName: nextGroupKey, elements: elements }
    }
  return;
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