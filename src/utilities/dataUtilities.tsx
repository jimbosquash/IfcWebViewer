import { buildingElement } from "./IfcUtilities";




export function getStationBarChartArray(elements: buildingElement[]) : any[]
{
    // group by station
    
    const groupedByStation: Record<string, Record<string, buildingElement[]>> = {};


    elements.forEach(element => {
        const stationFilter = element.properties.find(prop => prop.name === "Station")
        const productCodeFilter = element.properties.find(prop => prop.name === "Productcode")

        if(stationFilter && productCodeFilter)
        {
            const station = stationFilter.value;
            const productCode = productCodeFilter.value;

            var codeCategory;// = "Other"
            if(productCode.includes('UN')){
                codeCategory = "UN"
            } 
            else if (productCode.includes("EP")){
                codeCategory = "EP"
            } 
            else if (productCode.includes("CE")) {
                codeCategory = "CE"
            }


            if(!groupedByStation[station]) {
                groupedByStation[station] = {}
            }

            if(codeCategory && !groupedByStation[station][codeCategory]) {
                groupedByStation[station][codeCategory] = [];
            }

            if(codeCategory)
                groupedByStation[station][codeCategory].push(element)
        }
    })

    //console.log("grouped by station and code ",groupedByStation);


    return convertToStationArray(groupedByStation);

}

type StationSummary = {
    station: string;
    CE: number;
    UN: number;
    EP: number;
    Other: number;
    [key: string]: number | string; // Allow for dynamic category properties
  };

function convertToStationArray(groupedByStation: Record<string, Record<string, buildingElement[]>>) : any[] {
    const stationSummary: any[] = [];

    for (const station in groupedByStation)
    {
        if(groupedByStation.hasOwnProperty(station)) {
            const stationObj: StationSummary = {
                station: station,
                CE: 0,
                UN: 0,
                EP: 0,
                Other: 0
              };

            for(const category in groupedByStation[station]) {
                if(category && groupedByStation[station].hasOwnProperty(category)) {
                    stationObj[category] = groupedByStation[station][category].length
                }
            }
            stationSummary.push(stationObj);

        }
    }
    console.log("grouped by station and code ",stationSummary);
    return stationSummary;

}

export function getTotalValue(propertyName: string,buildingElements: buildingElement[]) : number {
    const totalObject = buildingElements.reduce((sumElement,item) => {
        const price = item.properties.find(prop => prop.name === propertyName);
        const numPrice =  price ? parseFloat(price?.value) : 0 
        sumElement.total += numPrice;
        return sumElement;
    }, {total: 0});
    return totalObject.total;
}

export function convertToPieChartValue(groupedElements: Record<string, buildingElement[]>) {
    const pieChartValue = Object.entries(groupedElements).map(([key, elements], index) => ({
        id: key,
        label: key,
        value: elements.length
    }));

    return pieChartValue;
}

export function groupByProperty(elements: buildingElement[], propertyName: string): Record<string, buildingElement[]> {
    return elements.reduce((acc, element) => {
      const materialProperty = element.properties.find(prop => prop.name.toLowerCase() === propertyName.toLowerCase());
      const material = materialProperty ? materialProperty.value : 'Unknown';
  
      if (!acc[material]) {
        acc[material] = [];
      }
      
      acc[material].push(element);
      
      return acc;
    }, {} as Record<string, buildingElement[]>);
  }
