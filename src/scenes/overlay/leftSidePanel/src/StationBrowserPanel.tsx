import { Box, ButtonGroup } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { Tree, TreeNode } from "../../../../utilities/Tree";
import { BuildingElement, IfcElement, SelectionGroup, VisibilityState } from "../../../../utilities/types";
import { ModelViewManager } from "../../../../bim-components/modelViewer";
import React from "react";
import { TreeUtils } from "../../../../utilities/treeUtils";
import MemoizedTreeTableRows from "./MemoizedTreeTableRows";
import { convertToBuildingElement, setVisibility } from "../../../../utilities/BuildingElementUtilities";

const treeName = ModelViewManager.stationTreeName;

export const StationBrowserPanel: React.FC = React.memo(() => {
  const [nodes, setNodes] = useState<TreeNode<IfcElement>[]>();
  const [nodeVisibility, setNodeVisibility] = useState<Map<string, VisibilityState>>(); // key = node.id, value = visibility state
  const [visibleOnDoubleClick, setVisibleOnDoubleClick] = useState<boolean>(true);
  const components = useComponentsContext();

  const modelViewManager = useMemo(() => components?.get(ModelViewManager), [components]);

  // called on component change
  const getPropertyTree = useCallback(
    (tree: Tree<BuildingElement>) => {
      if (!tree || !modelViewManager) return;

      console.log("get existing tree, in event listener",tree,modelViewManager)
      if (!tree) return;
      setNodeVisibility(modelViewManager.getVisibilityMap(tree.id));
      console.log('building elements for assembly tree',[...tree.root.children.values()])
      setNodes([...tree.root.children.values()]);
    },
    [modelViewManager]
  );

  useEffect(() => {
    if (!components) return;
    const existingTree = modelViewManager.getTree(treeName)?.tree;

    if (existingTree !== undefined) {
      console.log("get existing tree",existingTree)
      getPropertyTree(existingTree);
    }

  }, [components, getPropertyTree]);

    // make visible on double click
    const handleDoubleClick = useCallback((node: TreeNode<IfcElement>) => {
      if (!node || !components) return;
      console.log('double click')
      const elements = convertToBuildingElement(TreeUtils.getChildrenNonNullData(node));
      setVisibility(elements,components, true)

      if (modelViewManager?.SelectedGroup?.groupName === node.name ) {
        console.log("set selection ending early, selection has matching name");
        return;
      }

      const selectedGroup: SelectionGroup = {
        id: node?.id,
        groupType: node.type,
        groupName: node.name,
        elements: elements,
      };
      modelViewManager.setSelectionGroup(selectedGroup, true, treeName, true);
    }, [components, visibleOnDoubleClick]);

    
  const clearAllVisibility = () => {
    const map = new Map(modelViewManager.GroupVisibility);
    const selectedId = modelViewManager.SelectedGroup?.id;
    if (!selectedId) return;
    const neighbors = modelViewManager.Tree?.getNodes(
      (n) => n.type === modelViewManager.SelectedGroup?.groupType
    ).flatMap((n) => n.id);
    neighbors?.push(selectedId);
    if (!neighbors) return;

    map.forEach((entry, key) => {
      map.set(key, neighbors?.find((ne) => ne === key) ? VisibilityState.Visible : VisibilityState.Hidden);
    });

    modelViewManager.GroupVisibility = map;
  };

  // // store and set the visibility of all nodes
  // const setVisibility = useCallback(
  //   (nodeID: string, enabled: boolean) => {
  //     if (!nodeID || !nodeVisibility?.has(nodeID) || !components || !nodes) return;

  //     setNodeVisibility((prev) => {
  //       const newVisMap = new Map(prev);
  //       newVisMap.set(nodeID, enabled ? VisibilityState.Visible : VisibilityState.Hidden);
  //       return newVisMap;
  //     });

  //     const viewManager = components.get(ModelViewManager);
  //     const cache = components.get(ModelCache);

  //     const node = nodes.find((n) => n.id === nodeID);
  //     if (!node) return;
  //     const elements = convertToBuildingElement(TreeUtils.getChildrenNonNullData(node));

  //     elements.forEach((e) => {
  //       if (viewManager.ExludedElements.has(e) === enabled) {
  //         enabled ? viewManager.ExludedElements.delete(e) : viewManager.ExludedElements.add(e);
  //       }

  //       const frag = cache.getFragmentByElement(e);
  //       if (frag) {
  //         frag.setVisibility(enabled, [e.expressID]);
  //       }
  //     });
  //   },
  //   [nodeVisibility, components, nodes]
  // );
  
  return (
    <>
      <div
        style={{
          alignContent: "center",
          top: "0%",
          left: 0,
          zIndex: 50,
          width: "100%",
        }}
      >
        {/* fixed panel section */}

        <ButtonGroup style={{ flexShrink: 0, marginTop: "18px", marginBottom: "10px", justifyContent: "center" }}>
        </ButtonGroup>

        <Box component="div" m="0px" maxHeight="100%" overflow="hidden" width="100%">
          <MemoizedTreeTableRows onDoubleClick={handleDoubleClick} nodes={nodes} treeName={treeName}  />
        </Box>
      </div>
    </>
  );
});

export default StationBrowserPanel;

