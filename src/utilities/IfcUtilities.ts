
import { numberInputClasses } from "@mui/base";
import { ThreeDRotation } from "@mui/icons-material";
import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";
import * as THREE from 'three'
import { FragmentIdMap } from "@thatopen/fragments";
import * as WEBIFC from "web-ifc";
import { ModelCache } from "../bim-components/modelCache";
import { BuildingElement } from "./types";
import { Tag } from "../bim-components/modelTagger/src/Tag";

// allows you to pass these idmaps into helpful functions with @thatopen
export function GetFragmentIdMaps(elements: BuildingElement[], components: OBC.Components) {

    if (!components) return;

    const cache = components.get(ModelCache);
    if (!cache) return;

    let result: FragmentIdMap[] = [];

    const elementsByModel = elements.reduce((acc, e) => {
        const modelId = e.modelID;
        if (!acc.has(modelId)) {
            acc.set(modelId, [])
        }
        acc.get(modelId)!.push(e.expressID)
        return acc;

    }, new Map<string, number[]>);


    elementsByModel.forEach((expressIds, modelId) => {
        const model = cache.getModel(modelId);
        if (!model) return;
        const fragIdMap = model?.getFragmentMap(expressIds);
        result = result.concat(fragIdMap)

        Object.entries(fragIdMap).forEach((value,key) => {
            const fragment = model.items.find(frag => frag.id === value[0])
            if(!fragment) return;

        })
    });
    return result;
}


// export function GetFragment(FragmentIdMap : FragmentIdMap, components: OBC.Components)
// {
//     const cache = components.get(ModelCache);
//     const model = cache.getModel(modelId);

//     Object.entries(FragmentIdMap).forEach((value,key) => {
//         const fragment = model.items.find(frag => frag.id === value[0])
//         if(!fragment) return;

//     })

// }




/**
 * search all input Model's fragments and check visibility through HiddenIds collection.
 * @param models all ifc models to search from
 * @returns a map of model id (uuid) to a set of expressIds
 */
export function GetAllVisibleExpressIDs(models: FRAGS.FragmentsGroup[]): Map<string, Set<number>> {
    const allVisibleElements = new Map<string, Set<number>>();
    models.forEach(model => {
        const visibleElements = new Set<number>;
        // get expressIDs of eleemnts that are visible by searching fragments
        model.items.forEach(frag => {
            [...frag.ids].filter(x => !frag.hiddenItems.has(x)).forEach(id => visibleElements.add(id));
        })
        allVisibleElements.set(model.uuid, visibleElements)
    })
    return allVisibleElements;
}

export function GetCenterPoints(models: FRAGS.FragmentsGroup[], buildingElements: BuildingElement[], components: OBC.Components): Map<BuildingElement, Tag> {

    const tags = new Map<BuildingElement, Tag>();

    buildingElements.forEach((buildingElement) => {
        const model = models.find(m => m.uuid === buildingElement.modelID);
        if (!model) {
            console.log('Get Center failed: no model found', buildingElement.modelID)
            return;
        }
        const center = GetCenterPoint(buildingElement, model, components);
        if (!center) {
            console.log('Get Center failed: no center point found', buildingElement)
            return;
        }
        tags.set(buildingElement, new Tag(buildingElement.name, center));
    })
    return tags;
}

/**
 * Get a bounding box using the OBC.boundingBoxer and then get its center, reseting boundingBoxer after completion.
 * @param buildingElement 
 * @param model to find the correct model call models.find(m => m.uuid === buildingElement.modelID) on the ModelCache
 * @param components 
 * @returns 
 */
export function GetCenterPoint(buildingElement: BuildingElement, model: FRAGS.FragmentsGroup, components: OBC.Components): THREE.Vector3 | undefined {
    const bbox = GetBoundingBox(buildingElement, model, components);
    if (!bbox) return;
    const center = new THREE.Vector3();
    return bbox.getCenter(center);
}

/**
 * 
 * @param buildingElement 
 * @param model to find the correct model call models.find(m => m.uuid === buildingElement.modelID) on the ModelCache
 * @param components 
 * @returns 
 */
export function GetBoundingBox(buildingElement: BuildingElement, model: FRAGS.FragmentsGroup, components: OBC.Components) {
    const bbox = components.get(OBC.BoundingBoxer);
    bbox.reset();
    if (!model) return;

    //get fragment

    const fragment = model.items.find(frag => frag.id === buildingElement.FragmentID)

    if (!fragment) {
        console.log('unable to find fragment based on input building element', buildingElement)
        return;
    }
    //get the itemsID
    // const id = fragment.instanceToItem.get(buildingElement.expressID);

    // if (!id) {
    //     console.log('unable to find fragment based on input building element expressID', buildingElement.expressID,fragment)
    //     return;
    // }

    bbox.addMesh(fragment.mesh, [buildingElement.expressID]);

    const bounds = bbox.get();
    const center = new THREE.Vector3();
    const newCenter = bounds.getCenter(center);
    bbox.reset();
    return bounds;
}


/**
 * gets the expressID numbers for each fragment enabling you to get the specific instances of a Types representations
 * @param expressIds IDs of elements you wish to get
 * @param fragments the Fragment manager instance
 * @param ifcModel the ifc model where these elements come from
 * @returns 
 */
export function GetFragmentsFromExpressIds(expressIds: number[], fragments: OBC.FragmentsManager, ifcModel: FRAGS.FragmentsGroup | undefined): Map<FRAGS.Fragment, number[]> {
    if (!ifcModel)
        return new Map<FRAGS.Fragment, number[]>();

    // get the map of elements to their type "type = the underling element that represents multiple of the same element"
    const elementTypeIds = ifcModel.getFragmentMap(expressIds);
    const elementTypesFragment = getFragmentsByKeys(fragments.list, Object.keys(elementTypeIds))
    //console.log("element types of task",elementTypesFragment)

    const result = getOverlappingMap(elementTypesFragment, expressIds);
    return result;



    function getFragmentsByKeys(
        fragmentMap: Map<string, FRAGS.Fragment>,
        keys: string[]
    ): FRAGS.Fragment[] {

        return keys.reduce<FRAGS.Fragment[]>((result, key) => {
            const fragment = fragmentMap.get(key);
            if (fragment) {
                result.push(fragment);
            }
            return result;
        }, []);
    }

    // Select only some of the instances of a Type's representations to be used.
    function getOverlappingMap(elementTypesFragment: FRAGS.Fragment[], expressIds: number[]): Map<FRAGS.Fragment, number[]> {
        const overlappingMap = new Map<FRAGS.Fragment, number[]>();

        for (const elementType of elementTypesFragment) {
            const overlappingArray = expressIds.filter(id1 => elementType.ids.has(id1));
            overlappingMap.set(elementType, overlappingArray);
        }

        return overlappingMap;
    }

}


export function getStationBarChartArray(elements: BuildingElement[]): any[] {
    // group by station

    const groupedByStation: Record<string, Record<string, BuildingElement[]>> = {};


    elements.forEach(element => {
        const stationFilter = element.properties.find(prop => prop.name === "Station")
        const productCodeFilter = element.properties.find(prop => prop.name === "Productcode")

        if (stationFilter && productCodeFilter) {
            const station = stationFilter.value;
            const productCode = productCodeFilter.value;

            var codeCategory: string = "";// = "Other"
            if (productCode.includes('UN')) {
                codeCategory = "UN"
            }
            else if (productCode.includes("EP")) {
                codeCategory = "EP"
            }
            else if (productCode.includes("CE")) {
                codeCategory = "CE"
            }


            if (!groupedByStation[station]) {
                groupedByStation[station] = {}
            }

            if (!groupedByStation[station][codeCategory]) {
                groupedByStation[station][codeCategory] = [];
            }

            groupedByStation[station][codeCategory].push(element)
        }
    })

    //console.log("grouped by station and code ",groupedByStation);


    return convertToStationArray(groupedByStation);

}
interface StationObj {
    station: string;
    CE: 0;
    UN: 0;
    EP: 0;
    Other: 0;
    [key: string]: string | Number;
};

function convertToStationArray(groupedByStation: Record<string, Record<string, BuildingElement[]>>): any[] {
    const stationSummary: any[] = [];

    for (const station in groupedByStation) {
        if (groupedByStation.hasOwnProperty(station)) {
            const stationObj: StationObj = {
                station: station,
                CE: 0,
                UN: 0,
                EP: 0,
                Other: 0,
            };

            for (const category in groupedByStation[station]) {
                if (groupedByStation[station].hasOwnProperty(category)) {
                    stationObj[category] = groupedByStation[station][category].length
                }
            }
            stationSummary.push(stationObj);

        }
    }
    console.log("grouped by station and code ", stationSummary);
    return stationSummary;

}


export function getEPElementCount(elements: BuildingElement[]) {
    return elements.filter(element => element.properties.some(property => property.value.includes("EP-"))).length;
}


export function getUniqueElementCount(elements: BuildingElement[]) {
    const groupedByProductCode: Record<string, BuildingElement[]> = {};


    elements.forEach(element => {
        const codeFilter = element.properties.find(prop => prop.name === "Productcode")
        if (codeFilter) {
            const productCode = codeFilter.value;
            if (!groupedByProductCode[productCode]) {
                groupedByProductCode[productCode] = []
            }
            groupedByProductCode[productCode].push(element)

        }
    })
    return Object.keys(groupedByProductCode).length;
}

export async function GetBuildingElements(loadedModel: FRAGS.FragmentsGroup, components: OBC.Components | undefined) {
    if (!components) {
        console.log('components not set, getBuildingElements exiting')
        return [];
    }
    // this process attempting example https://github.com/ThatOpen/engine_components/blob/318f4dd9ebecb95e50759eb41f290df57c008fb3/packages/core/src/ifc/IfcRelationsIndexer/index.ts#L235
    const foundElements = new Map<number, BuildingElement>();// = Map<number,buildingElement[]>;
    const elements = loadedModel.getLocalProperties();
    console.log('getBuildingElements: elements')
    await OBC.IfcPropertiesUtils.getRelationMap(loadedModel, WEBIFC.IFCRELDEFINESBYPROPERTIES, (async (propertySetID, _relatedElementsIDs) => {

        if(!_relatedElementsIDs) {
            // console.log('getBuildingElements: _relatedElementsIDs',propertySetID, _relatedElementsIDs)
            return;}

        _relatedElementsIDs.forEach(relatingElement => {
            // console.log('getBuildingElements: relatingElement',relatingElement)

            if (elements && relatingElement) {
                const element = elements[relatingElement]
                // console.log("element related", element)
                const fragKey = Object.keys(loadedModel.getFragmentMap([element.expressID]))[0]

                let newElement = foundElements.get(relatingElement);
                if (!newElement) {
                    newElement = {
                        expressID: element.expressID,
                        GlobalID: element.GlobalId?.value,
                        FragmentID: fragKey,
                        type: element.type,
                        name: element.Name?.value,
                        properties: [],
                        modelID: loadedModel.uuid
                    };
                }
                if (!newElement) return;

                const pSetName = elements[propertySetID];
                // console.log("element ifc pset", pSetName)
                OBC.IfcPropertiesUtils.getPsetProps(loadedModel, propertySetID, (async (propertyId) => {
                    const property = elements[propertyId];
                    if (!property)
                        return;

                    newElement?.properties.push({
                        name: property.Name.value,
                        value: property.NominalValue.value,
                        pSet: "Test"
                    })

                    // const propertyName = property.Name?.value;
                    // const propertyValue = property.NominalValue?.value;
                    // if (propertyName) {
                    //     newElement.properties.push({ name: propertyName, value: propertyValue });
                    // }

                    // if(propertyName && propertyName.toLowerCase === "name")
                    //     {newElement.name = propertyValue;}
                }))


                foundElements.set(relatingElement, newElement)
            }
        })
    }))
    // console.log("building Elements", foundElements)
    return Array.from(foundElements.values());
}

