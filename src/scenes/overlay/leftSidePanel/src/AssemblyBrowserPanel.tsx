import { Icon } from "@iconify/react";
import { Box, Button, ButtonGroup, colors, Tooltip } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { TreeNode, TreeUtils } from "../../../../utilities/Tree";
import { BuildingElement, knownProperties, VisibilityState } from "../../../../utilities/types";
import { ModelCache } from "../../../../bim-components/modelCache";
import { ModelViewManager } from "../../../../bim-components/modelViewer";
import { setUpTreeFromProperties } from "../../../../utilities/BuildingElementUtilities";
import TreeTableRow from "../../../../components/TreeTableRow";
import React from "react";

const treeName = ModelViewManager.defaultyTreeName;
const treeStructure = [knownProperties.Assembly, knownProperties.BuildingStep];

export const AssemblyBrowserPanel: React.FC = React.memo(() => {
  const [nodes, setNodes] = useState<TreeNode<BuildingElement>[]>();
  const [nodeVisibility, setNodeVisibility] = useState<Map<string, VisibilityState>>(); // key = node.id, value = visibility state
  const [visibleOnDoubleClick, setVisibleOnDoubleClick] = useState<boolean>(true);
  const components = useComponentsContext();

  const modelViewManager = useMemo(() => components?.get(ModelViewManager), [components]);

  // called on component change
  const getPropertyTree = useCallback(
    (buildingElements: BuildingElement[]) => {
      if (!buildingElements || !modelViewManager) return;

      let existingTreeContainer = modelViewManager.getViewTree(treeName);

      const newTree = setUpTreeFromProperties(treeName, buildingElements, treeStructure);
      existingTreeContainer = modelViewManager.addOrReplaceTree(
        treeName,
        newTree,
        existingTreeContainer?.visibilityMap
      );

      if (!existingTreeContainer) return;
      setNodeVisibility(existingTreeContainer.visibilityMap);
      setNodes([...existingTreeContainer.tree.root.children.values()]);
    },
    [modelViewManager]
  );

  useEffect(() => {
    if (!components) return;
    const cache = components.get(ModelCache);
    const viewManager = components.get(ModelViewManager);
    cache.onBuildingElementsChanged.add((data) => getPropertyTree(data));

    if (cache.BuildingElements) {
      let existingTreeContainer = viewManager.getViewTree(treeName);
      if (!existingTreeContainer) {
        const newTree = setUpTreeFromProperties(treeName, cache.BuildingElements, treeStructure);
        existingTreeContainer = viewManager.addOrReplaceTree(treeName, newTree);
      }
      if (!existingTreeContainer) return;

      setNodeVisibility(existingTreeContainer.visibilityMap);
      setNodes([...existingTreeContainer.tree.root.children.values()]);
    }

    return () => {
      components.get(ModelCache).onBuildingElementsChanged.remove((data) => getPropertyTree(data));
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
          variant="Flat"
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
            />
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
          <Tooltip
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
          {/* 
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
