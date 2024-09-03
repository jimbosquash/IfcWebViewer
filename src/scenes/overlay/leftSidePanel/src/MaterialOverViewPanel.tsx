import { Icon } from "@iconify/react";
import { Box, Button, ButtonGroup, colors, IconButton, Tooltip, Typography, useTheme } from "@mui/material";
import { Component, useEffect, useState } from "react";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { nonSelectableTextStyle } from "../../../../styles";
import { tokens } from "../../../../theme";
import { Tree, TreeNode, TreeUtils } from "../../../../utilities/Tree";
import { BuildingElement } from "../../../../utilities/types";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import { GetFragmentIdMaps } from "../../../../utilities/IfcUtilities";
import { ModelCache } from "../../../../bim-components/modelCache";
import { Visibility } from "@mui/icons-material";
import { ModelViewManager } from "../../../../bim-components/modelViewer";

interface TreeOverviewProps {
  name: string;
  tree: Tree<BuildingElement> | undefined;
}

export const MaterialOverviewPanel: React.FC<TreeOverviewProps> = ({ tree, name }) => {
  const [nodes, setNodes] = useState<TreeNode<BuildingElement>[]>();
  const [nodeVisibility, setNodeVisibility] = useState<Map<string, boolean>>(); // key = node.id, value = visibility state
  const [visibleOnDoubleClick, setVisibleOnDoubleClick] = useState<boolean>(true);
  const components = useComponentsContext();

  useEffect(() => {
    if (!tree) return;

    // now remove top tree as its project
    const children = [...tree.root.children.values()];

    if(!nodeVisibility) {
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
      if(!frag) return;
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
          padding: "0px",
          width: "100%",
        }}
      >
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
        <div>
          <Box component="div" m="10px" maxHeight="100%" overflow="auto" width="90%">
            {nodes &&
              Array.from(nodes).map((data) => (
                <FloatingBox
                  name={data.name}
                  node={data}
                  key={data.id}
                  isEnabled={nodeVisibility?.get(data.id) ?? false}
                  setEnabled={(args, enabled) => setVisibility(args, enabled)}
                  visibleOnDoubleClick={visibleOnDoubleClick}
                />
              ))}
          </Box>
        </div>
      </div>
    </>
  );
};

interface TreeNodeBoxProps {
  name: string;
  node: TreeNode<BuildingElement> | undefined;
  visibleOnDoubleClick: boolean;
  isEnabled: boolean;
  setEnabled: (args: string, enabled: boolean) => void;
}

// i want to be able to change the elements visibility from out side the const

const FloatingBox: React.FC<TreeNodeBoxProps> = ({ name, node, visibleOnDoubleClick, isEnabled, setEnabled }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  // const [isVisible, setIsVisible] = useState<boolean>(isEnabled); // check this

  useEffect(() => {
    console.log("child container", node);
  }, []);

  // on double click select 3d geometry
  const handelDoubleClick = () => {
    const highlighter = components.get(OBF.Highlighter);

    if (!node) return;
    const elements = TreeUtils.getChildrenNonNullData(node);
    const idMaps = GetFragmentIdMaps(elements, components);
    if (!idMaps || !idMaps[0]) return;

    const cache = components.get(ModelCache);

    // figure out which elements are hidden and if hidden set visibility on fragment
    if (visibleOnDoubleClick) {
      elements.forEach((element) => {
        const frag = cache.getFragmentByElement(element);
        if (!frag || !frag.hiddenItems.has(element.expressID)) return;
        frag.setVisibility(true, [element.expressID]);
      });
    }

    //find out whats visible and only select that
    const fragmentIdMap: FRAGS.FragmentIdMap = {};

    // go through each fragment id map and if any of those elements are hidden then dont include them or create a new fragment idMap
    elements.forEach((element) => {
      const frag = cache.getFragmentByElement(element);

      // Skip if fragment doesn't exist or if the element is not hidden
      if (!frag || !frag.hiddenItems.has(element.expressID)) return;

      // If this fragment ID doesn't exist in our object yet, initialize it with an empty Set
      if (!fragmentIdMap[frag.id]) {
        fragmentIdMap[frag.id] = new Set<number>();
      }

      fragmentIdMap[frag.id].add(element.expressID);
    });

    highlighter.highlightByID("select", fragmentIdMap, false, false, undefined);
    setEnabled(node?.id ?? "", true);
    setIsSelected(true);
  };

  // on hover highlight 3d geometry
  useEffect(() => {
    const highlighter = components.get(OBF.Highlighter);

    if (!node) return;
    const elements = TreeUtils.getChildrenNonNullData(node);
    const idMaps = GetFragmentIdMaps(elements, components);
    // get fragmentID
    if (!idMaps || !idMaps[0]) return;

    if (isHovered) {
      highlighter.highlightByID("hover", idMaps[0], true, false, undefined);
    } else {
      highlighter.clear("hover");
    }
    // console.log("hover clear", highlighter?.selection["hover"]);
  }, [isHovered]);

  return (
    <Tooltip title={name} arrow placement="right">
      <Box component="div">
        <Box
          component="div"
          onDoubleClick={() => handelDoubleClick()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          sx={{
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            padding: isHovered ? "8px" : "10px",
            width: isHovered ? "95%" : "92%",
            height: "30px",
            margin: "8px 0",
            borderRadius: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            borderColor: colors.grey[1000],
            // border: isSelected ? "1.5px solid #ccc" : "0.8px solid #ccc",
            border: "0.8px solid #ccc",
            backgroundColor: isHovered ? colors.grey[800] : colors.grey[1000],
            transition: "all 0.2s ease",
            justifyContent: "space-between",
            overflow: "hidden", // Ensures no overflow issues
          }}
        >
          <Icon icon="game-icons:wood-beam" color={isHovered ? colors.primary[100] : colors.grey[500]} />
          <Typography
            noWrap
            // maxWidth="105px"
            minWidth="20px"
            align="left"
            textAlign="left"
            alignContent="left"
            sx={{
              flexGrow: 1,
              color: isHovered ? colors.primary[100] : colors.grey[600],
              ...nonSelectableTextStyle,
              ml: 1,
              display: { xs: "none", sm: "block" },
              variant: isSelected ? "body2" : "body1",
              whiteSpace: "nowrap", // Prevents wrapping
              overflow: "hidden", // Hides overflow content
              textOverflow: "ellipsis", // Adds ellipsis to overflow text
            }}
          >
            {name}
            {/* {displayName} */}
          </Typography>
          <Typography
            noWrap
            variant="body2"
            sx={{
              ...nonSelectableTextStyle,
              marginLeft: "10px",
              color: isHovered ? colors.primary[100] : colors.grey[600],
              variant: "body2",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: { xs: "none", sm: "block" }, // Responsive: hides on extra small screens
            }}
          >
            Qnt : {node?.children?.size ?? ""}
          </Typography>
          <IconButton
            size="small"
            sx={{ marginLeft: "8px", color: isHovered ? colors.primary[100] : colors.grey[500] }}
            onClick={(e: any) => {
              e.stopPropagation();
              setEnabled(node?.id ?? "", !isEnabled);
            }}
          >
            {isEnabled ? <Icon icon="mdi:checkbox-outline" /> : <Icon icon="mdi:checkbox-blank-outline" />}
          </IconButton>
        </Box>
      </Box>
    </Tooltip>
  );
};

export default MaterialOverviewPanel;
