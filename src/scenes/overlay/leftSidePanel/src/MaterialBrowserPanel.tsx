import { Icon } from "@iconify/react";
import { Box, Button, ButtonGroup, colors, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { Tree, TreeNode, TreeUtils } from "../../../../utilities/Tree";
import { BuildingElement } from "../../../../utilities/types";
import { ModelCache } from "../../../../bim-components/modelCache";
import { ModelViewManager } from "../../../../bim-components/modelViewer";
import TreeTableRow from "../../../../components/TreeTableRow";

interface TreeOverviewProps {
  name: string;
  tree: Tree<BuildingElement> | undefined;
}

export const MaterialBrowserPanel: React.FC<TreeOverviewProps> = ({ tree, name }) => {
  const [nodes, setNodes] = useState<TreeNode<BuildingElement>[]>();
  const [nodeVisibility, setNodeVisibility] = useState<Map<string, boolean>>(); // key = node.id, value = visibility state
  const [visibleOnDoubleClick, setVisibleOnDoubleClick] = useState<boolean>(true);
  const components = useComponentsContext();

  useEffect(() => {
    if (!tree) return;

    // now remove top tree as its project
    const children = [...tree.root.children.values()];

    if (!nodeVisibility) {
      const map = new Map([...children].map((data) => [data.id, true]));
      setNodeVisibility(map);
    }

    // console.log("children", children);

    setNodes(children);
  }, [tree]);

  const setVisibility = (nodeID: string, enabled: boolean) => {
    console.log("node visibilty map:", nodeVisibility);
    if (!nodeID || nodeVisibility?.get(nodeID) === undefined) {
      console.log("node visibilty toggle failed no node id:", nodeID);
      return;
    }

    const newVisMap = new Map(nodeVisibility);
    newVisMap.set(nodeID, enabled);
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
          alignContent: "stretch",
          top: "0%",
          left: 0,
          zIndex: 50,
          width: "100%",
        }}
      >
        {/* fixed panel section */}

        <ButtonGroup style={{ marginTop: "18px", marginBottom: "10px", alignSelf: "center" }}>
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
          {nodes &&
            Array.from(nodes).map((data) => (
              <TreeTableRow
                name={data.name}
                icon="game-icons:wood-beam"
                node={data}
                key={data.id}
                variant="Flat"
                isEnabled={nodeVisibility?.get(data.id) ?? false}
                setEnabled={(args, enabled) => setVisibility(args, enabled)}
                visibleOnDoubleClick={visibleOnDoubleClick}
              />
            ))}
        </Box>
      </div>
    </>
  );
};

export default MaterialBrowserPanel;
