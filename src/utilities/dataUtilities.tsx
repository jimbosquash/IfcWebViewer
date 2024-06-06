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
