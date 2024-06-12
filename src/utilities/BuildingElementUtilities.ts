
export interface buildingElement {
    expressID: number;
    GlobalID: string;
    type: number;
    name: string;
    properties: {name: string, value: string}[]
}

export const groupElements = (buildingElements: buildingElement[],groupType: "BuildingStep" | "Station") => {
    if(buildingElements)
    {
      return buildingElements.reduce((acc, element) => {
        const buildingStep = element.properties.find(prop => prop.name === groupType)?.value || 'Unknown'; 
        if(buildingStep === 'Unknown')
          return acc;
        if (!acc[buildingStep]) {
          acc[buildingStep] = [];
        }
        acc[buildingStep].push(element);
        return acc;
      }, {} as { [key: string]: buildingElement[] });
    }
    return {};
  };