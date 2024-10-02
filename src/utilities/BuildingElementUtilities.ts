import { Tree, TreeNode } from "./Tree";
import { SelectionGroup, BuildingElement, KnowGroupType, knownProperties } from "./types";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front"
import { ModelCache } from "../bim-components/modelCache";
import { GetCenterPoint, GetFragmentIdMaps } from "./IfcUtilities";
import { ModelViewManager } from "../bim-components/modelViewer";
import { FragmentsGroup } from "@thatopen/fragments";
import { Components } from "@thatopen/components";
import { TreeUtils } from "./treeUtils";


/**
 * takes in the current group, the building elements to search from (select by matching type) and the direction
 * we assume the group name will matach a node name in the input tree
 */
export function GetAdjacentGroup(
  current: SelectionGroup | undefined,
  tree: Tree<BuildingElement> | undefined,
  direction: 'next' | 'previous' = 'next'
): SelectionGroup | undefined {

  if (!tree) return undefined;

  // If no current group, return the first group
  if (!current) return getFirstGroup(tree);

  const groupOfType = tree.getNodes(n => n.type === current.groupType).map(n => n.id);
  // console.log("Group of same type",tree,current, groupOfType);

  if (!groupOfType) {
    // console.log("Get adjacent group failed. grouping type not found", current.groupType);
    return undefined;
  }

  const currentIndex = groupOfType.indexOf(current.id);

  let adjacentIndex: number;
  if (direction === 'next') {
    adjacentIndex = (currentIndex === -1 || currentIndex === groupOfType.length - 1) ? 0 : currentIndex + 1;
  } else {
    adjacentIndex = (currentIndex === -1 || currentIndex === 0) ? groupOfType.length - 1 : currentIndex - 1;
  }

  const newNode = tree.getNode(groupOfType[adjacentIndex]);
  // console.log("New group selection",currentIndex, newNode);

  if (newNode) {
    return { groupType: newNode.type, id: newNode.id, groupName: newNode.name, elements: TreeUtils.getChildrenNonNullData(newNode) };
  }

  return undefined;
}

function getFirstGroup(tree: Tree<BuildingElement>) {

  const firstGroup = tree.getFirstOrUndefinedNode(n => n.type !== "Project");
  console.log('getting default group', firstGroup, tree)

  if (!firstGroup) return undefined;

  const el = TreeUtils.getChildren(firstGroup, n => n.type === KnowGroupType.BuildingElement)
    .map(n => n.data)
    .filter((data): data is NonNullable<typeof data> => data != null)
    .flat();


  return { groupType: firstGroup.type, id: firstGroup.id, groupName: firstGroup.name, elements: el };
}

/**
 * Group by Model ID for easy handeling
 * @returns key = ModuleID, value = Building Elements 
 */
export function groupByModelID(buildingElements : BuildingElement[]) :  Map<string, BuildingElement[]> {
  return buildingElements.reduce((acc, element) => {
    if (!acc.get(element.modelID)) {
        acc.set(element.modelID, [])
    }
    acc.get(element.modelID)?.push(element)
    return acc;
}, new Map<string, BuildingElement[]>);
}

export function mapByName(buildingElements: BuildingElement[]) {
  return buildingElements.reduce((acc, element) => {
      if (!acc.has(element.name)) {
          acc.set(element.name, [])
      }
      acc.get(element.name)?.push(element)
      return acc;
  }, new Map<string, BuildingElement[]>);
}


/**
 * Zooms to elements by getting their fragmetIDs, creating a bounding box with their meshes and calling camera.control.fitToSphere
 * @param elements Elements to zoom
 * @param components instance of components
 * @returns 
 */
export async function zoomToBuildingElements(elements: BuildingElement[] | undefined, components: OBC.Components, allowTransition: boolean, buffer: number = 0.8) {
  if (!components || !elements) return;
  const cache = components.get(ModelCache);
  if (!cache.world) return;

  const fragments = components.get(OBC.FragmentsManager);
  const bbox = components.get(OBC.BoundingBoxer);
  bbox.reset();

  const idMaps = GetFragmentIdMaps(elements, components);

  if (!idMaps) return;
  idMaps.forEach(idMap => {
    for (const fragID in idMap) {
      const fragment = fragments.list.get(fragID);

      if (!fragment) continue;

      const ids = idMap[fragID];
      bbox.addMesh(fragment.mesh, ids);
      // console.log("zooming to selected",fragment)

    }
  });

  const sphere = bbox.getSphere();
  const i = Infinity;
  const mi = -Infinity;
  const { x, y, z } = sphere.center;
  const isInf = sphere.radius === i || x === i || y === i || z === i;
  const isMInf = sphere.radius === mi || x === mi || y === mi || z === mi;
  const isZero = sphere.radius === 0;
  if (isInf || isMInf || isZero) {
    return;
  }

  sphere.radius *= buffer;
  const camera = cache.world.camera as OBC.OrthoPerspectiveCamera;
  await camera.controls.fitToSphere(sphere, allowTransition);

  // if(allowTransition)
  // setTimeout(async () => {
  //   await camera.controls.fitToSphere(sphere, allowTransition);
  // }, 10);
};

// TODO: change method so that it highlights input building elements 
export const selectElements = (elements: BuildingElement[] | undefined, components: OBC.Components) => {
  if (!components || !elements) return;
  const cache = components.get(ModelCache);
  if (!cache.world) return;

  const fragments = components.get(OBC.FragmentsManager);
  const bbox = components.get(OBC.BoundingBoxer);
  bbox.reset();

  const idMaps = GetFragmentIdMaps(elements, components);

  if (!idMaps) return;
  idMaps.forEach(idMap => {
    for (const fragID in idMap) {
      const fragment = fragments.list.get(fragID);

      if (!fragment) continue;

      const ids = idMap[fragID];
      bbox.addMesh(fragment.mesh, ids);
      // console.log("zooming to selected",fragment)

    }
  });

  const sphere = bbox.getSphere();
  const i = Infinity;
  const mi = -Infinity;
  const { x, y, z } = sphere.center;
  const isInf = sphere.radius === i || x === i || y === i || z === i;
  const isMInf = sphere.radius === mi || x === mi || y === mi || z === mi;
  const isZero = sphere.radius === 0;
  if (isInf || isMInf || isZero) {
    return;
  }
  sphere.radius *= 0.8;
  const camera = cache.world.camera as OBC.OrthoPerspectiveCamera;

  setTimeout(async () => {
    camera.controls.fitToSphere(sphere, true);
  }, 10);
};

/**
 * Selected elements, if elements invisible first make visible then select
 * @param elements elements to highlight
 * @param components instance of component used
 * @param clearPrevious clear all previous selected elements, default true
 * @returns 
 */
export const select = async (elements: BuildingElement[], components: OBC.Components, clearPrevious: boolean = true) => {
  if (!elements || !components) return;
  console.log("high light these elements")

  const highlighter = components.get(OBF.Highlighter);
  const hider = components.get(OBC.Hider);
  const modelCache = components.get(ModelCache);

  // we need to group by model id incase we have mulitpl models open 
  // so we know which model to search from
  const elementsByModelId = new Map<string, BuildingElement[]>();

  for (const element of elements) {
    const groupID = element.modelID;
    if (!groupID || !element) continue;
    if (!elementsByModelId.has(groupID)) {
      elementsByModelId.set(groupID, []);
    }
    elementsByModelId.get(groupID)!.push(element);
  }

  if (clearPrevious)
    await highlighter.clear('select');


  const highlightPromises = Array.from(elementsByModelId.entries()).map(async ([modelId, elements]) => {
    const model = modelCache.getModel(modelId);
    if (!model) return;

    const expressIds = elements.flatMap(e => e.expressID);
    const elementTypeIds = model.getFragmentMap(expressIds);
    // console.log("high light these elements",elementTypeIds)
    await highlighter.highlightByID("select", elementTypeIds,clearPrevious, false);
    hider.set(true, elementTypeIds)
  });

  await Promise.all(highlightPromises);
}

/**
 * Isolates building elements, hiding all other geometry
 * @param elements 
 * @param components 
 * @returns 
 */
export const isolate = async (elements: BuildingElement[], components: OBC.Components) => {
  if (!elements || !components) return;

  const hider = components.get(OBC.Hider);
  const modelCache = components.get(ModelCache);

  // we need to group by model id incase we have mulitpl models open 
  // so we know which model to search from
  const elementsByModelId = new Map<string, BuildingElement[]>();

  for (const element of elements) {
    const groupID = element.modelID;
    if (!groupID || !element) continue;
    if (!elementsByModelId.has(groupID)) {
      elementsByModelId.set(groupID, []);
    }
    elementsByModelId.get(groupID)!.push(element);
  }

  const highlightPromises = Array.from(elementsByModelId.entries()).map(async ([modelId, elements]) => {
    const model = modelCache.getModel(modelId);
    if (!model) return;

    const expressIds = elements.flatMap(e => e.expressID);
    const elementTypeIds = model.getFragmentMap(expressIds);
    hider.isolate(elementTypeIds)
    const selectedElements = components.get(ModelCache).getElementByFragmentIdMap(elementTypeIds)
    if (!selectedElements) return;
    components.get(ModelViewManager).onVisibilityUpdated.trigger([...selectedElements])
  });

  await Promise.all(highlightPromises);
}

/**
 * Get the distance between the center point of two building elements
 * @param a 
 * @param b 
 * @param model 
 * @param components 
 * @returns 
 */
export function distanceToCenter(a: BuildingElement, b: BuildingElement, model: FragmentsGroup,components : Components) {
  const aCenter = GetCenterPoint(a, model, components);
  const bCenter = GetCenterPoint(b, model, components);
  if(!bCenter) return;
  return aCenter?.distanceTo(bCenter);
}

export const setUpContainedByTree = ( elements: BuildingElement[]) => {

}


/**
 * Create a tree structure by using the input node order to group building elements by their property.
 * we assume that grouping is done by property values and that building elements have the properties 
 * in node order.
 */
export const setUpTreeFromProperties = (id: string, elements: BuildingElement[], propertyNames: string[] | knownProperties[]) => {

  const tree = new Tree<BuildingElement>(id, "Project", "Project");
  const root = tree.getNode("Project")


  function createSortedSubTree(tree: Tree<BuildingElement>, parentNode: TreeNode<BuildingElement>, currentElements: any[], currentLevel: number) {
    if (currentLevel >= propertyNames.length) {
      // We've reached the leaf level, add elements as leaf nodes
      currentElements.forEach((element, index) => {
        tree.addNode(parentNode.id, `${parentNode.id}_${index}`, element.name, "BuildingElement", element, true);
      });
      return;
    }

    const currentNodeType = propertyNames[currentLevel];
    const groupedElements = groupElementsByPropertyName(currentElements, currentNodeType);
    const sortedGroups = sortGroupedElements(groupedElements);

    sortedGroups.forEach(([groupValue, groupElements]) => {
      const nodeId = `${parentNode.id}_${currentNodeType}_${groupValue}`;

      tree.addNode(parentNode.id, nodeId, groupValue, currentNodeType);
      createSortedSubTree(tree, tree.getNode(nodeId)!, groupElements, currentLevel + 1);
    });
  }

  if (root)
    createSortedSubTree(tree, root, elements, 0)
  //console.log('tree created', id,elements,tree)
  return tree;
}


function sortGroupedElements(groupedElements: Map<string, any[]>): [string, any[]][] {
  const entries = Array.from(groupedElements.entries());
  // console.log('sorting', Array.from(groupedElements.keys()));

  // Function to extract the first number (including decimals) from a string
  const extractNumber = (str: string): [number, number] => {
    const match = str.match(/(\d+)(?:\.(\d+))?/);
    if (match) {
      const integerPart = parseInt(match[1]);
      const decimalPart = match[2] ? parseInt(match[2]) : 0;
      return [integerPart, decimalPart];
    }
    return [Infinity, 0];
  };

  // Custom sort function
  entries.sort((a, b) => {
    const [aInt, aDec] = extractNumber(a[0]);
    const [bInt, bDec] = extractNumber(b[0]);
    // console.log('sort between', `${aInt}.${aDec}`, `${bInt}.${bDec}`);

    if (aInt !== bInt) {
      return aInt - bInt; // Compare integer parts
    }

    if (aDec !== bDec) {
      return aDec - bDec; // Compare decimal parts as integers
    }

    // If numbers are the same, fall back to alphabetical comparison
    // console.log('sorted one', a[0].localeCompare(b[0]));
    return a[0].localeCompare(b[0]);
  });

  // console.log('sorted', entries.map(e => e[0]));
  return entries;
}




// function sortGroupedElements(groupedElements: Map<string, any[]>): [string, any[]][] {
//   const entries = Array.from(groupedElements.entries());

//   // Separate entries into numeric and non-numeric prefixes
//   const numericEntries: [string, any[]][] = [];
//   const nonNumericEntries: [string, any[]][] = [];

//   entries.forEach(entry => {
//     const prefix = entry[0].split('_')[0];
//     if (!isNaN(parseFloat(prefix)) && isFinite(parseFloat(prefix))) {
//       numericEntries.push(entry);
//     } else {
//       nonNumericEntries.push(entry);
//     }
//   });

//   // Sort numeric entries using a custom comparison function
//   numericEntries.sort((a, b) => {
//     const aPrefix = a[0].split('_')[0];
//     const bPrefix = b[0].split('_')[0];
    
//     // Split the prefix into integer and decimal parts
//     const [aInt, aDec = '0'] = aPrefix.split('.');
//     const [bInt, bDec = '0'] = bPrefix.split('.');
    
//     // Compare integer parts first
//     const intComparison = parseInt(aInt) - parseInt(bInt);
//     if (intComparison !== 0) {
//       return intComparison;
//     }
    
//     // If integer parts are equal, compare decimal parts
//     return parseInt(aDec) - parseInt(bDec);
//   });

//   // Combine sorted numeric entries with unsorted non-numeric entries
//   return [...numericEntries, ...nonNumericEntries];
// }


export const groupElementsByPropertyName = (elements: BuildingElement[], property: string): Map<string, BuildingElement[]> => {
  const grouped = new Map<string, BuildingElement[]>();
  elements.forEach(element => {
    if (!element.properties) {
      console.log('element failed to find property', element, elements)
      return;
    }
    const value = element.properties.find(prop => prop.name === property)?.value || 'Unknown';
    // if(value === "Unknown")
    //   console.log("unknown data found",property,element.properties )
    if (!grouped.has(value)) {
      grouped.set(value, []);
    }
    grouped.get(value)!.push(element);
  });
  return grouped;
};

export const GetPropertyByName = (element: BuildingElement, propertyName: knownProperties) => {
  if (!element || !propertyName)
    return;

  return element.properties.find(p => p.name === propertyName);
}