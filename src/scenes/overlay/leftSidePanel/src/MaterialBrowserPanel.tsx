import { Box } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { TreeNode } from "../../../../utilities/Tree";
import { BuildingElement, IfcElement, sustainerProperties, VisibilityState } from "../../../../utilities/types";
import { ModelCache } from "../../../../bim-components/modelCache";
import { ModelViewManager } from "../../../../bim-components/modelViewer";
import TreeTableRow from "../../../../components/TreeTableRow";
import {
  convertToBuildingElement,
  setUpTreeFromProperties,
  setVisibility,
} from "../../../../utilities/BuildingElementUtilities";
import { TreeUtils } from "../../../../utilities/treeUtils";
import { ViewableTree } from "../../../../bim-components/modelViewer/src/viewableTree";

const treeID = "MaterialTree";

export const MaterialBrowserPanel: React.FC = () => {
  const [nodes, setNodes] = useState<TreeNode<IfcElement>[]>();
  const components = useComponentsContext();

  const modelViewManager = useMemo(() => components?.get(ModelViewManager), [components]);

  useEffect(() => {
    modelViewManager.onBuildingElementsChanged.add((data) => handleNewElements(data));
    const elements = components.get(ModelCache).buildingElements;
    if (elements) {
      handleNewElements(elements);
    }

    return () => {
      modelViewManager.onBuildingElementsChanged.remove((data) => handleNewElements(data));
    };
  }, [components]);

  function handleNewElements(elements: BuildingElement[]): void {
    if (!elements) return;
    const tree = setUpTreeFromProperties(treeID, elements, [sustainerProperties.Material]);
    const _ = modelViewManager.setTree(new ViewableTree(tree.id, tree));
    setNodes([...tree?.root?.children?.values()]);
  }

  // make visible on double click
  const handleClick = useCallback(
    (node: TreeNode<IfcElement>) => {
      if (!node || !components) return;
      console.log("double click");

      let elements = convertToBuildingElement(TreeUtils.getChildrenNonNullData(node));

      // filter out elements that are not in the current selection group
      if (modelViewManager.SelectedGroup) {
        elements = elements.filter((e) =>
          modelViewManager.SelectedGroup?.elements.some((e2) => e2.expressID === e.expressID)
        );
      }

      // console.log("new vis state filtered elements", elements);

      const visState = modelViewManager.getVisibilityState(treeID, node.id);
      // console.log("current vis state", visState);
      const newVisState = visState === VisibilityState.Visible ? VisibilityState.Hidden : VisibilityState.Visible;
      console.log("new vis state", newVisState, node.id);

      // setVisibility(elements, components, newVisState === VisibilityState.Visible);

      modelViewManager.setVisibilityState(treeID, node.id, newVisState, true);
      modelViewManager.updateVisibility(treeID);
    },
    [components, modelViewManager]
  );

  return (
    <>
      <div
        style={{
          alignContent: "stretch",
          top: "0%",
          left: 0,
          zIndex: 50,
          width: "100%",
        }}
      >
        {/* All children Rows */}

        <Box component="div" m="0px" maxHeight="100%" overflow="hidden" width="100%">
          {nodes &&
            Array.from(nodes).map((data) => (
              <TreeTableRow
                onToggleVisibility={handleClick}
                onDoubleClick={handleClick}
                onClick={handleClick}
                name={data.name}
                treeID={treeID}
                icon="game-icons:wood-beam"
                node={data}
                key={data.id}
                variant="Flat"
              />
            ))}
        </Box>
      </div>
    </>
  );
};

export default MaterialBrowserPanel;
