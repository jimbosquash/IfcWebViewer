import { Box, ButtonGroup } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import {  TreeNode } from "../../../../utilities/Tree";
import {  IfcElement, SelectionGroup } from "../../../../utilities/types";
import { ModelViewManager } from "../../../../bim-components/modelViewer";
import React from "react";
import { TreeUtils } from "../../../../utilities/treeUtils";
import MemoizedTreeTableRows from "./MemoizedTreeTableRows";
import { convertToBuildingElement, setVisibility } from "../../../../utilities/BuildingElementUtilities";
import { ViewableTree } from "../../../../bim-components/modelViewer/src/viewableTree";

const treeID = ModelViewManager.assemblyTreeName;

export const AssemblyBrowserPanel: React.FC = React.memo(() => {
  const [nodes, setNodes] = useState<TreeNode<IfcElement>[]>();
  const components = useComponentsContext();

  const modelViewManager = useMemo(() => components?.get(ModelViewManager), [components]);

  // called on component change
  const getPropertyTree = useCallback(
    (tree: ViewableTree<IfcElement>) => {
      if (!tree || !modelViewManager) return;

      console.log("get existing tree, in event listener",tree,modelViewManager)
      if (!tree) return;
      console.log('building elements for assembly tree',[...tree.root.children.values()])
      setNodes([...tree.root.children.values()]);
    },
    [modelViewManager]
  );

  useEffect(() => {
    if (!components) return;
    const existingTree = modelViewManager.getTree(treeID);

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
    modelViewManager.setSelectionGroup(selectedGroup, true, treeID, true);
  }, [components]);
  
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
          <MemoizedTreeTableRows onDoubleClick={handleDoubleClick} nodes={nodes} treeName={treeID} />
        </Box>
      </div>
    </>
  );
});

export default AssemblyBrowserPanel;

