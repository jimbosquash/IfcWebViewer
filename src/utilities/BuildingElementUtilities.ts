import { Tree, TreeNode, TreeUtils } from "./Tree";
import { SelectionGroup, BuildingElement, KnowGroupType, knownProperties } from "./types";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front"
import { ModelCache } from "../bim-components/modelCache";
import { GetFragmentIdMaps } from "./IfcUtilities";
import { ModelViewManager } from "../bim-components/modelViewer";


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
  console.log('getting default group',firstGroup,tree)

  if (!firstGroup) return undefined;

  const el = TreeUtils.getChildren(firstGroup, n => n.type === KnowGroupType.BuildingElement)
    .map(n => n.data)
    .filter((data): data is NonNullable<typeof data> => data != null)
    .flat();


  return { groupType: firstGroup.type, id: firstGroup.id, groupName: firstGroup.name, elements: el };
}


/**
 * Zooms to elements by getting their fragmetIDs, creating a bounding box with their meshes and calling camera.control.fitToSphere
 * @param elements Elements to zoom
 * @param components instance of components
 * @returns 
 */
export async function zoomToBuildingElements (elements : BuildingElement[] | undefined, components: OBC.Components, allowTransition: boolean, buffer: number = 0.8) {
  if (!components || !elements) return;
  const cache = components.get(ModelCache);
  if (!cache.world) return;

  const fragments = components.get(OBC.FragmentsManager);
  const bbox = components.get(OBC.BoundingBoxer);
  bbox.reset();

  const idMaps = GetFragmentIdMaps(elements,components);

  if(!idMaps) return;
  idMaps.forEach(idMap => {
    for(const fragID in idMap) {
      const fragment = fragments.list.get(fragID);

      if(!fragment) continue;

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
export const selectElements = (elements : BuildingElement[] | undefined, components: OBC.Components) => {
  if (!components || !elements) return;
  const cache = components.get(ModelCache);
  if (!cache.world) return;

  const fragments = components.get(OBC.FragmentsManager);
  const bbox = components.get(OBC.BoundingBoxer);
  bbox.reset();

  const idMaps = GetFragmentIdMaps(elements,components);

  if(!idMaps) return;
  idMaps.forEach(idMap => {
    for(const fragID in idMap) {
      const fragment = fragments.list.get(fragID);

      if(!fragment) continue;

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
  if (!elements|| !components) return;
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

  if(clearPrevious)
    await highlighter.clear('select');


  const highlightPromises = Array.from(elementsByModelId.entries()).map(async ([modelId, elements]) => {
      const model = modelCache.getModel(modelId);
      if (!model) return;

      const expressIds = elements.flatMap(e => e.expressID);
      const elementTypeIds = model.getFragmentMap(expressIds);
      // console.log("high light these elements",elementTypeIds)
      await highlighter.highlightByID("select", elementTypeIds,false,false);
      hider.set(true,elementTypeIds)
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
  if (!elements|| !components) return;

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
      if(!selectedElements) return;
      components.get(ModelViewManager).onVisibilityUpdated.trigger([...selectedElements])
  });

  await Promise.all(highlightPromises);
}

/**
 * Create a tree structure by using the input node order to group building elements by their property.
 * we assume that grouping is done by property values and that building elements have the properties 
 * in node order.
 */
export const setUpTreeFromProperties = (id: string,elements: BuildingElement[], nodeOrder: string[] | knownProperties[] = ["Station", "BuildingStep"]) => {

  const tree = new Tree<BuildingElement>(id,"Project", "Project");
  const root = tree.getNode("Project")

  const createSubTree = (parentNode: TreeNode<BuildingElement>, currentElements: BuildingElement[], currentLevel: number) => {
    if (currentLevel >= nodeOrder.length) {
      // We've reached the leaf level, add elements as leaf nodes
      currentElements.forEach((element, index) => {
        tree.addNode(parentNode.id, `${parentNode.id}_${index}`, element.name, "BuildingElement", element, true);
      });
      return;
    }

    const currentNodeType = nodeOrder[currentLevel];
    //console.log("Grouping elements by prop", currentElements,currentNodeType)
    const groupedElements = groupElementsByPropertyName(currentElements, currentNodeType);

    groupedElements.forEach((groupElements, groupValue) => {
      const nodeId = `${parentNode.id}_${currentNodeType}_${groupValue}`;
      tree.addNode(parentNode.id, nodeId, groupValue, currentNodeType);
      // console.log('create subTree',tree.getNode(nodeId),groupElements )
      createSubTree(tree.getNode(nodeId)!, groupElements, currentLevel + 1);
    });
  };

  if (root)
    createSubTree(root, elements, 0)
  //console.log('tree created', id,elements,tree)
  return tree;
}

export const groupElementsByPropertyName = (elements: BuildingElement[], property: string): Map<string, BuildingElement[]> => {
  const grouped = new Map<string, BuildingElement[]>();
  elements.forEach(element => {
    if(!element.properties){
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

export const GetPropertyByName = (element:BuildingElement, propertyName: knownProperties) => {
  if(!element || !propertyName)
   return;

   return element.properties.find(p => p.name === propertyName);
}