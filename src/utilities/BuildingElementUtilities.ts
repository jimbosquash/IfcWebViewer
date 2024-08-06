import { Tree, TreeNode, TreeUtils } from "./Tree";
import { SelectionGroup, BuildingElement, KnowGroupType } from "./types";
import * as OBC from "@thatopen/components";
import { ModelCache } from "../bim-components/modelCache";
import { GetFragmentIdMaps } from "./IfcUtilities";


// takes in the current grou, the building elements to search from (select by matching type) and the direction
export function GetAdjacentGroup(
  current: SelectionGroup | undefined,
  tree: Tree<BuildingElement> | undefined,
  direction: 'next' | 'previous' = 'next'
): SelectionGroup | undefined {
  if (!tree) return undefined;

  // If no current group, return the first or last station group based on direction
  if (!current) {

    const station = tree.getFirstOrUndefinedNode(n => n.type === KnowGroupType.Station.toString());
    if (!station) return undefined;

    const el = TreeUtils.getChildren(station, n => n.type === KnowGroupType.BuildingElement.toString())
      .map(n => n.data)
      .filter((data): data is NonNullable<typeof data> => data != null)
      .flat();

    return { groupType: "Station", id: station.id, groupName: station.name, elements: el };
  }

  const groupOfType = tree.getNodes(n => n.type === current.groupType).map(n => n.id);
  console.log("Group of same type", groupOfType);

  if (!groupOfType) {
    console.log("Get adjacent group failed. grouping type not found", current.groupType);
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
  console.log("New group selection",currentIndex, newNode);

  if (newNode) {
    return { groupType: newNode.type, id: newNode.id, groupName: newNode.name, elements: TreeUtils.getChildrenNonNullData(newNode) };
  }

  return undefined;
}

export const setUpGroup = (elements: BuildingElement[]) => {
  // make the groups and then pack them together
  let stations = groupElementsByProperty(elements, "Station")
  let steps = groupElementsByProperty(elements, "BuildingStep")
  const groupMap = new Map<string, Map<string, BuildingElement[]>>();
  groupMap.set("Station", stations);
  groupMap.set("BuildingStep", steps);
  return groupMap;
}

export const zoomToSelected = (elements : BuildingElement[] | undefined, components: OBC.Components) => {
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

export const setUpTree = (elements: BuildingElement[], nodeOrder: string[] = ["Station", "BuildingStep"]) => {

  const tree = new Tree<BuildingElement>("Project", "Project");
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
    const groupedElements = groupElementsByProperty(currentElements, currentNodeType);
    console.log("Grouping elements by prop", groupedElements)

    groupedElements.forEach((groupElements, groupValue) => {
      const nodeId = `${parentNode.id}_${currentNodeType}_${groupValue}`;
      tree.addNode(parentNode.id, nodeId, groupValue, currentNodeType);
      createSubTree(tree.getNode(nodeId)!, groupElements, currentLevel + 1);
    });
  };

  if (root)
    createSubTree(root, elements, 0)

  return tree;
}

export const groupElementsByProperty = (elements: BuildingElement[], property: string): Map<string, BuildingElement[]> => {
  const grouped = new Map<string, BuildingElement[]>();
  elements.forEach(element => {
    const value = element.properties.find(prop => prop.name === property)?.value || 'Unknown';
    if(value === "Unknown")
      console.log("unknown data found",property,element.properties )
    if (!grouped.has(value)) {
      grouped.set(value, []);
    }
    grouped.get(value)!.push(element);
  });
  return grouped;
};