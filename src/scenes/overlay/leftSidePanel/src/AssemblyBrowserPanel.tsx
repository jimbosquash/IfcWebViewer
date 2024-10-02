import { Box, ButtonGroup } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { Tree, TreeNode } from "../../../../utilities/Tree";
import { BuildingElement, VisibilityState } from "../../../../utilities/types";
import { ModelCache } from "../../../../bim-components/modelCache";
import { ModelViewManager } from "../../../../bim-components/modelViewer";
import TreeTableRow from "../../../../components/TreeTableRow";
import React from "react";
import { TreeUtils } from "../../../../utilities/treeUtils";

const treeName = ModelViewManager.defaultyTreeName;

export const AssemblyBrowserPanel: React.FC = React.memo(() => {
  const [nodes, setNodes] = useState<TreeNode<BuildingElement>[]>();
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
      setNodes([...tree.root.children.values()]);
    },
    [modelViewManager]
  );

  useEffect(() => {
    if (!components) return;
    const viewManager = components.get(ModelViewManager);
    viewManager.onTreeChanged.add((data) => getPropertyTree(data));

    let existingTree = modelViewManager.Tree;

    if (existingTree) {
      console.log("get existing tree",existingTree)
      setNodeVisibility(modelViewManager.getVisibilityMap(existingTree.id));
      setNodes([...existingTree.root.children.values()]);
    }

    return () => {
      viewManager.onTreeChanged.remove((data) => getPropertyTree(data));

    };
  }, [components, getPropertyTree]);

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

  // store and set the visibility of all nodes
  const setVisibility = useCallback(
    (nodeID: string, enabled: boolean) => {
      if (!nodeID || !nodeVisibility?.has(nodeID) || !components || !nodes) return;

      setNodeVisibility((prev) => {
        const newVisMap = new Map(prev);
        newVisMap.set(nodeID, enabled ? VisibilityState.Visible : VisibilityState.Hidden);
        return newVisMap;
      });

      const viewManager = components.get(ModelViewManager);
      const cache = components.get(ModelCache);

      const node = nodes.find((n) => n.id === nodeID);
      if (!node) return;
      const elements = TreeUtils.getChildrenNonNullData(node);

      elements.forEach((e) => {
        if (viewManager.ExludedElements.has(e) === enabled) {
          enabled ? viewManager.ExludedElements.delete(e) : viewManager.ExludedElements.add(e);
        }

        const frag = cache.getFragmentByElement(e);
        if (frag) {
          frag.setVisibility(enabled, [e.expressID]);
        }
      });
    },
    [nodeVisibility, components, nodes]
  );

  const memoizedTreeTableRows = useMemo(
    () =>
      nodes &&
      nodes.map((data) => (
        <TreeTableRow
          key={data.id}
          name={data.name}
          treeID={treeName}
          icon=""
          node={data}
          variant="Floating"
          //isEnabled={nodeVisibility?.get(data.id) === VisibilityState.Visible}
          //setEnabled={(args, enabled) => setVisibility(args, enabled)}
          visibleOnDoubleClick={visibleOnDoubleClick}
        >
          {Array.from(data.children.values()).map((childData) => (
            <TreeTableRow
              key={childData.id}
              name={childData.name}
              treeID={treeName}
              icon=""
              variant="Flat"
              node={childData}
              //isEnabled={nodeVisibility?.get(childData.id) === VisibilityState.Visible}
              //setEnabled={(args, enabled) => setVisibility(args, enabled)}
              visibleOnDoubleClick={visibleOnDoubleClick}
            >
              {[...childData.children.values()].find(child => child.type !== "BuildingElement") && Array.from(childData.children.values()).map((childChildData) => (
                <TreeTableRow
                key={childChildData.id}
                name={childChildData.name}
                treeID={treeName}
                icon=""
                variant="Flat"
                node={childChildData}
                //isEnabled={nodeVisibility?.get(childData.id) === VisibilityState.Visible}
                //setEnabled={(args, enabled) => setVisibility(args, enabled)}
                visibleOnDoubleClick={visibleOnDoubleClick}
              />
              ))}
            </TreeTableRow>
          ))}
        </TreeTableRow>
      )),
    [nodeVisibility, setVisibility, visibleOnDoubleClick]
  );

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
          {/* <Tooltip
            title={
              visibleOnDoubleClick
                ? "Dont make visible hidden items on double click"
                : "Make visible hidden items on double click"
            }
          >
            <Button variant="contained" onClick={() => clearAllVisibility()}>
              <Icon style={{ color: colors.grey[600] }} icon="ic:outline-layers-clear" />
            </Button>
          </Tooltip>
          
          <Tooltip title={"Select All"}>
            <Button variant="contained" onClick={() => setVisibleOnDoubleClick(!visibleOnDoubleClick)}>
              <Icon style={{ color: colors.grey[600] }} icon="mdi:checkbox-multiple-marked-outline" />
            </Button>
          </Tooltip>
          <Tooltip title={"Clear all selection"}>
            <Button variant="contained" onClick={() => setVisibleOnDoubleClick(!visibleOnDoubleClick)}>
              <Icon style={{ color: colors.grey[600] }} icon="mdi:checkbox-multiple-blank-outline" />
            </Button>
          </Tooltip> */}
        </ButtonGroup>

        <Box component="div" m="0px" maxHeight="100%" overflow="hidden" width="100%">
          {memoizedTreeTableRows}
        </Box>
      </div>
    </>
  );
});

export default AssemblyBrowserPanel;
