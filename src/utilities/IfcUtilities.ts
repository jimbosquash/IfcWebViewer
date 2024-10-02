
import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";
import * as THREE from 'three'
import { FragmentIdMap } from "@thatopen/fragments";
import * as WEBIFC from "web-ifc";
import { ModelCache } from "../bim-components/modelCache";
import { BasicProperty, BuildingElement, IfcElement } from "./types";
import { markProperties } from "../bim-components/modelTagger/src/Tag";
import { IfcCategories, IfcCategoryMap, IfcElements, IfcPropertiesUtils } from "@thatopen/components";
import { Tree } from "./Tree";

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

        Object.entries(fragIdMap).forEach((value, key) => {
            const fragment = model.items.find(frag => frag.id === value[0])
            if (!fragment) return;

        })
    });
    return result;
}

// allows you to pass these idmaps into helpful functions with @thatopen
export function GetVisibleFragmentIdMaps(elements: BuildingElement[], components: OBC.Components): FRAGS.FragmentIdMap[] {

    if (!components) return [];

    const cache = components.get(ModelCache);
    if (!cache) return [];

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
        console.log('get visible fragments id map', fragIdMap, expressIds)
        result = result.concat(fragIdMap)

        Object.entries(fragIdMap).forEach(([fragID, value], key) => {

            const fragment = model.items.find(frag => frag.id === fragID)
            if (!fragment) return;

            const test = fragIdMap[fragID];
            fragIdMap[fragID] = new Set([...test].filter(x => fragment.hiddenItems.has(x)))
        })
    });
    console.log("test", result)

    return result;
}


/**
 * search all input Model's fragments and check visibility through HiddenIds collection.
 * @param models all ifc models to search from
 * @returns a map of key =  modelID (uuid), value = Set<expressIds>
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

/**
 * Find the visible building elements based on the fragment hidden collection and return grouped by modelID
 * @param buildingElements 
 * @param components 
 * @returns key = ModelID, Value = ExpressIDs
 */
export function GetVisibleExpressIDs(buildingElements: BuildingElement[], components: OBC.Components): Map<string, Set<number>> {
    const fragments = getFragments(buildingElements, components)
    let allVisibleElements: Map<string, Set<number>> = new Map();
    fragments.forEach((elements, fragment) => {
        if (!elements) return;

        const modelID = elements[0].modelID;

        const visibleIdSet = [...fragment.ids].filter(x => !fragment.hiddenItems.has(x));
        // console.log('get visible elementIds', visibleIdSet, [...fragment.ids], fragment.hiddenItems)
        const group = allVisibleElements.get(modelID);
        if (group)
            visibleIdSet.forEach(e => group.add(e));
        else {
            allVisibleElements.set(modelID, new Set(visibleIdSet))
        }
    })
    // console.log('all visible elementIds', allVisibleElements)
    return allVisibleElements;
}

/**
 * get express ids by model
 * @param buildingElements 
 * @returns Key = modelID, value = expressIDs
 */
export function getExpressIDsByModel(buildingElements: BuildingElement[]) {
    const elementsByModel = buildingElements.reduce((acc, e) => {
        const modelId = e.modelID;
        if (!acc.has(modelId)) {
            acc.set(modelId, [])
        }
        acc.get(modelId)!.push(e.expressID)
        return acc;

    }, new Map<string, number[]>);
    return elementsByModel;
}


export function getFragments(buildingElements: BuildingElement[], components: OBC.Components): Map<FRAGS.Fragment, BuildingElement[]> {
    const expressIDsByModel = getExpressIDsByModel(buildingElements);
    if (!expressIDsByModel) return new Map();

    const cache = components.get(ModelCache);

    // search each model incase there are multiple for fragments
    const fragments: Map<FRAGS.Fragment, BuildingElement[]> = new Map();
    expressIDsByModel.forEach((expressIds, modelId) => {
        const model = cache.getModel(modelId);
        if (!model) return;

        // get fragment id by building element express id groups and return fragment with relevant building Elements
        const fragIdMap = model?.getFragmentMap(expressIds);
        Object.entries(fragIdMap).forEach(([fragID, expressIDs], index) => {
            const fragment = model.items.find(frag => frag.id === fragID)
            if (!fragment) return;
            // get the building elements by express ids and set to fragment Map
            fragments.set(fragment, buildingElements.filter(be => expressIDs.has(be.expressID)))
        })
    });

    console.log('get fragments', expressIDsByModel, fragments)
    return fragments;
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

export async function GetBuildingElements(model: FRAGS.FragmentsGroup, components: OBC.Components | undefined): Promise<BuildingElement[]> {
    if (!components) {
        console.log('components not set, getBuildingElements exiting')
        return [];
    }

    const newElements: BuildingElement[] = []// = Map<number,buildingElement[]>;


    const indexer = components.get(OBC.IfcRelationsIndexer);
    await indexer.process(model);
    const classifier = components.get(OBC.Classifier);
    classifier.byEntity(model);

    for (const [systemName, system] of Object.entries(classifier.list)) {
        // console.log('System name:', systemName)

        for (const [className, map] of Object.entries(system)) {
            // console.log(`  Class: ${className}`, map);

            for (const [id, expressIDs] of Object.entries(map.map)) {
                // console.log(`  fragment: ${id}`, expressIDs);

                // Use Promise.all to handle multiple async operations in parallel
                await Promise.all([...expressIDs].map(async (expressID: number) => {
                    // console.log(`    expressID: ${expressID}`);


                    //get the element and its base info (name, ids, ect)
                    //get properties and add them to psets
                    const newElement = await getBuildingElementBase(expressID, id, model, indexer);

                    if (newElement) {
                        const props = await GetAllDefinedBy(model, indexer, expressID);
                        newElement.properties = props;
                        // Do something with props...
                        // console.log(`    props for ${expressID}:`, props);
                        // console.log('new element', newElement)
                        newElements.push(newElement)

                    } else {
                        console.log('failed to create building element from expressID:', expressID)
                    }
                }));

            }
        }
    }

    // FIRST CHECK IF PARENT RETURNS ANY WITH DECOMPOSES IF THATS NULL THEN TRYING getEntityRelations WITH ContainedInStructure. then group this elements by parent 

    // once that is done I will then want to construct a basic data tree. 

    // Usage
    // await buildTree(newElements,model,indexer)

    return newElements;
}


// Usage
async function buildTree(newElements: IfcElement[], model: any, indexer: any) {
    const relationTypes = ["Decomposes", "ContainedInStructure"];
    const tree = new Tree<IfcElement>('elementTree', 'Project', 'project');

    for (const element of newElements) {
        await findParentRecursively(tree, model, indexer, element, relationTypes);
    }
    console.log('Tree by file', tree);

    return tree;
}


async function findParentRecursively(
    tree: Tree<IfcElement>,
    model: any,
    indexer: any,
    element: IfcElement,
    relationTypes: string[],
    maxDepth: number = 10
): Promise<IfcElement | null> {
    if (maxDepth === 0) return null;

    let nodeInTree = tree.getNode(element.expressID.toString());
    if (!nodeInTree) {
        // If not, add it to the tree under the root (we'll move it later if needed)
        tree.addNode(tree.root.id, element.expressID.toString(), element.name || `Element_${element.expressID}`, element.type, element, true);
        nodeInTree = tree.getNode(element.expressID.toString());
    }

    for (const relationType of relationTypes) {
        const parents = indexer.getEntityRelations(model, element.expressID, relationType);

        if (parents && parents[0]) {
            let parentNode = tree.getNode(parents[0].toString());
            if (!parentNode) {
                // If parent doesn't exist, create it
                const parentElement = await model.getProperties(parents[0]);

                const parentEntity: IfcElement = {
                    expressID: parents[0],
                    name: parentElement.Name?.value,
                    type: IfcElements[parentElement.type],
                    GlobalID: parentElement.GlobalId?.value,
                };
                tree.addNode(tree.root.id, parentEntity.expressID.toString(), parentEntity.name || `Element_${parentEntity.expressID}`, parentEntity.type, parentEntity, false);
                parentNode = tree.getNode(parents[0].toString());
                // console.log("Parent created", parentNode);
            } else {
                // console.log("Parent found", parentNode);
            }

            // Move the current element under its parent
            if (nodeInTree && parentNode) {
                // console.log("Placing element under parent", nodeInTree, parentNode);

                // Instead of removing and re-adding, update the parent reference
                if (nodeInTree.parent) {
                    nodeInTree.parent.children.delete(nodeInTree.id);
                }
                nodeInTree.parent = parentNode;
                parentNode.children.set(nodeInTree.id, nodeInTree);
                // nodeInTree.isLeaf = true;  // Ensure the moved node is marked as a leaf
                // parentNode.isLeaf = false; // Ensure the parent is not marked as a leaf
            }

            const grandparent = await findParentRecursively(tree, model, indexer, parentNode!.data!, relationTypes, maxDepth - 1);

            return grandparent || parentNode!.data!;
        }
    }

    return nodeInTree?.data || null;
}


export type InverseAttributes = [
    "IsDecomposedBy",
    "Decomposes",
    "AssociatedTo",
    "HasAssociations",
    "ClassificationForObjects",
    "IsGroupedBy",
    "HasAssignments",
    "IsDefinedBy",
    "DefinesOcurrence",
    "IsTypedBy",
    "Types",
    "Defines",
    "ContainedInStructure",
    "ContainsElements"
];

export async function GetAssemblies(model: FRAGS.FragmentsGroup, components: OBC.Components | undefined): Promise<BuildingElement[]> {
    if (!components) {
        console.log('components not set, getBuildingElements exiting')
        return [];
    }

    const newElements: BuildingElement[] = []// = Map<number,buildingElement[]>;


    const indexer = components.get(OBC.IfcRelationsIndexer);
    await indexer.process(model);
    const classifier = components.get(OBC.Classifier);
    // classifier.byEntity(model);
    classifier.bySpatialStructure(model);

    const ifcElements = IfcElements;

    console.log("IfcElements", IfcElements)


    console.log('clasified spatial structres,', classifier.list)
    // each item in the list is the fragment guid and a list of express id of elements
    // each element needs to go find all its relations


    for (const [systemName, system] of Object.entries(classifier.list)) {
        // console.log('System name:', systemName)

        for (const [className, fragmentMap] of Object.entries(system)) {
            // console.log(`  Class: ${className}`);

            for (const [fragmentID, expressIDs] of Object.entries(fragmentMap.map)) {
                // console.log(`  fragment: ${fragmentID}`);

                // Use Promise.all to handle multiple async operations in parallel
                await Promise.all([...expressIDs].map(async (expressID: number) => {
                    // console.log(`    expressID: ${expressID}`);

                    //get the element and its base info (name, ids, ect)
                    //get properties and add them to psets
                    const newElement = await getBuildingElementBase(expressID, fragmentID, model, indexer);

                    if (newElement) {
                        const props = await GetAllDefinedBy(model, indexer, expressID);
                        newElement.properties = props;
                        // Do something with props...
                        // console.log(`    props for ${expressID}:`, props);
                        // console.log('new element', newElement)
                        newElements.push(newElement)

                    } else {
                        console.log('failed to create building element from expressID:', expressID)
                    }
                }));

            }
        }
    }

    return newElements;
}

/**
 * Create a building element with its base information filled out, no property sets assigned here.
 * @param expressID the id of the building element to find information of
 * @param fragmentID the fragment id representing the 3d geometry/ type of this element
 * @returns a building element with no property sets or undefined
 */
async function getBuildingElementBase(expressID: number, fragmentID: string, model: FRAGS.FragmentsGroup, indexer: OBC.IfcRelationsIndexer): Promise<BuildingElement | undefined> {

    const element = await model.getProperties(expressID);
    // console.log('element ', element);
    if (!element) {
        console.log("Failed to convert building element from expressID:", expressID)
        return;
    }

    const newElement: BuildingElement = {
        expressID: expressID,
        GlobalID: element.GlobalId?.value,
        FragmentID: fragmentID,
        type: IfcElements[element.type],
        name: element.Name?.value ?? undefined,
        properties: [],
        modelID: model.uuid
    }

    // try get name of its type
    if (newElement.name === undefined) {
        const type = indexer.getEntityRelations(model, expressID, "IsTypedBy");
        if (type) {
            for (const expressID of type) {
                if (newElement.name === undefined) {
                    const elementType = await model.getProperties(expressID);
                    // console.log('typed by ', elementType);
                    if (elementType) {
                        newElement.name = elementType.Name.value;
                        // console.log('name found on type', name)
                    }
                }
            }
        }
    }
    return newElement;
}

async function GetAllDefinedBy(model: FRAGS.FragmentsGroup, indexer: OBC.IfcRelationsIndexer, elementID: number): Promise<BasicProperty[]> {
    const psets = indexer.getEntityRelations(model, elementID, "IsDefinedBy");


    const props: BasicProperty[] = [];
    if (psets) {
        for (const expressID of psets) {
            // You can get the pset attributes like this
            const pset = await model.getProperties(expressID);
            // console.log(pset);
            // You can get the pset props like this or iterate over pset.HasProperties yourself
            await OBC.IfcPropertiesUtils.getPsetProps(
                model,
                expressID,
                async (propExpressID) => {
                    const prop = await model.getProperties(propExpressID);
                    // console.log(prop);
                    // props.push(prop)
                    props.push({ name: prop?.Name.value, value: prop?.NominalValue.value, pSet: pset?.Name })
                },
            );
        }
    }

    return props;

}
