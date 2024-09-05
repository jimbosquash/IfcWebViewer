import { Icon } from "@iconify/react";
import { Box, Button, ButtonGroup, colors, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { Tree, TreeNode, TreeUtils } from "../../../../utilities/Tree";
import { BuildingElement, knownProperties, VisibilityState } from "../../../../utilities/types";
import { ModelCache } from "../../../../bim-components/modelCache";
import { ModelViewManager } from "../../../../bim-components/modelViewer";
import { setUpTreeFromProperties } from "../../../../utilities/BuildingElementUtilities";
import TreeTableRow from "../../../../components/TreeTableRow";

export const AssemblyBrowserPanel: React.FC = () => {
  const [nodes, setNodes] = useState<TreeNode<BuildingElement>[]>();
  const [nodeVisibility, setNodeVisibility] = useState<Map<string, VisibilityState>>(); // key = node.id, value = visibility state
  const [visibleOnDoubleClick, setVisibleOnDoubleClick] = useState<boolean>(true);
  const components = useComponentsContext();
  const [tree, setTree] = useState<Tree<BuildingElement>>();
  const treeName = "AssemblyTree";
  const treeStructure = [knownProperties.Assembly, knownProperties.BuildingStep];

  useEffect(() => {
    if (!components) return;
    components.get(ModelCache).onBuildingElementsChanged.add((data) => getPropertyTree(data, treeStructure));
    const cache = components.get(ModelCache);
    const viewManager = components.get(ModelViewManager);
    if (cache.BuildingElements) {
      let existingTreeContainer = viewManager.getViewTree(treeName);
      if (!existingTreeContainer) {
        const newTree = setUpTreeFromProperties('assembly',cache.BuildingElements, treeStructure);
        existingTreeContainer = viewManager.addTree(treeName, newTree);
      }
      if (!existingTreeContainer) return;

      setTree(existingTreeContainer.tree);
      setNodeVisibility(existingTreeContainer.visibilityMap);
      setNodes([...existingTreeContainer.tree.root.children.values()]);
    }

    return () => {
      components.get(ModelCache).onBuildingElementsChanged.remove((data) => getPropertyTree(data, treeStructure));
    };
  }, [components]);

  const getPropertyTree = (buildingElements: BuildingElement[], propertyTree: string[]) => {
    if (!buildingElements) return;
    // create new tree and set it as view manager tree

    const matTree = setUpTreeFromProperties('assembly',buildingElements, propertyTree);
    const viewManager = components.get(ModelViewManager);
    let existingTreeContainer = viewManager.getViewTree(treeName);

    // if(existingTreeContainer) {
    //     const replicatedVisMap = existingTreeContainer.visibilityMap;
    // }

    const newTree = setUpTreeFromProperties('assembly',buildingElements, treeStructure);
    //todo : set up visMap so that it takes state from last time
    existingTreeContainer = viewManager.addTree(treeName, newTree, existingTreeContainer?.visibilityMap);

    if (!existingTreeContainer) return;
    setTree(existingTreeContainer.tree);
    setNodeVisibility(existingTreeContainer.visibilityMap);
  };


  const setVisibility = (nodeID: string, enabled: boolean) => {
    console.log("node visibilty map:", nodeVisibility);
    if (!nodeID || nodeVisibility?.get(nodeID) === undefined) {
      console.log("node visibilty toggle failed no node id:", nodeID);
      return;
    }

    const newVisMap = new Map(nodeVisibility);
    newVisMap.set(nodeID, enabled ? VisibilityState.Visible : VisibilityState.Hidden);
    setNodeVisibility(newVisMap);

    // now set up viewer hidden list

    const viewManager = components.get(ModelViewManager);
    const cache = components.get(ModelCache);

    const node = nodes?.find((n) => n.id === nodeID);
    if (!node) return;
    const elements = TreeUtils.getChildrenNonNullData(node);

    // add or remove item from hidden list

    elements.forEach((e) => {
      const exluded = viewManager.ExludedElements.has(e);

      if (exluded && enabled) {
        viewManager.ExludedElements.delete(e);
      } else if (!exluded && !enabled) {
        viewManager.ExludedElements.add(e);
      }
    });

    // then show or hide items in 3d space

    elements.forEach((element) => {
      const frag = cache.getFragmentByElement(element);
      if (!frag) return;
      frag.setVisibility(enabled, [element.expressID]);
    });
  };

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
            <Button variant="contained" onClick={() => setVisibleOnDoubleClick(!visibleOnDoubleClick)}>
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
          </Tooltip>
        </ButtonGroup>

        {/* All children Rows */}

        <Box component="div" m="0px" maxHeight="100%" overflow="hidden" width="100%">
          {tree &&
            Array.from(tree.root.children.values()).map((data) => (
              <TreeTableRow
                name={data.name}
                icon=''
                node={data}
                variant="Flat"
                key={data.id}
                isEnabled={nodeVisibility?.get(data.id) === VisibilityState.Visible}
                setEnabled={(args, enabled) => setVisibility(args, enabled)}
                visibleOnDoubleClick={visibleOnDoubleClick}
              >
                {data &&
                  Array.from(data.children.values()).map((data) => (
                    <TreeTableRow
                      name={data.name}
                      icon=''
                      variant="Flat"
                      node={data}
                      key={data.id}
                      isEnabled={nodeVisibility?.get(data.id) === VisibilityState.Visible}
                      setEnabled={(args, enabled) => setVisibility(args, enabled)}
                      visibleOnDoubleClick={visibleOnDoubleClick}
                    ></TreeTableRow>
                  ))}
              </TreeTableRow>
            ))}
        </Box>
      </div>
    </>
  );
};


export default AssemblyBrowserPanel;
