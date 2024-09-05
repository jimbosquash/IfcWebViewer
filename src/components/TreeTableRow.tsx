import { Icon } from "@iconify/react";
import { Box, IconButton, Tooltip, Typography, useTheme } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { ModelCache } from "../bim-components/modelCache";
import { useComponentsContext } from "../context/ComponentsContext";
import { nonSelectableTextStyle } from "../styles";
import { tokens } from "../theme";
import { GetFragmentIdMaps } from "../utilities/IfcUtilities";
import { TreeNode, TreeUtils } from "../utilities/Tree";
import { BuildingElement } from "../utilities/types";

import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";

export interface TreeTableRowProps {
  name: string;
  /**
   * this is a string in the format of iconify icons eg. "game-icons:wood-beam"
   */
  icon: string;
  node: TreeNode<BuildingElement> | undefined;
  visibleOnDoubleClick: boolean;
  isEnabled: boolean;
  setEnabled: (args: string, enabled: boolean) => void;
  children?: React.ReactNode; // Add this line to support children
  variant: "Floating" | "Flat";
//   parentHovered: boolean;
//   parentSelect: boolean;
}

export const TreeTableRow: React.FC<TreeTableRowProps> = ({
  name,
  node,
  icon,
  visibleOnDoubleClick,
  isEnabled,
  setEnabled,
  variant,
  children,
//   parentHovered = false,
//   parentSelect = false,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false); // check this

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

  
  const getColor = useCallback((element: 'text' | 'background') => {
    if (!isEnabled && !isHovered) {
      // Not visible state
      return element === 'text' ? colors.grey[800] : colors.primary[400];
    }
    if (isHovered) {
      // Hovered state
      return element === 'text' ? colors.primary[100] : colors.blueAccent[600];
    }
    // Normal state
    return element === 'background' ? colors.grey[1000] : colors.grey[500];
  }, [isEnabled, isHovered, colors]);


  const floatingBoxTheme = {
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
    backgroundColor: getColor('background'),
    transition: "all 0.1s ease",
    justifyContent: "space-between",
    overflow: "hidden", // Ensures no overflow issues
  };
  const flatBoxTheme = {
    // boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    padding: "0px",
    width: "100%",
    height: "30px",
    margin: "0px 0",
    // borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    borderColor: colors.grey[1000],
    // border: isSelected ? "1.5px solid #ccc" : "0.8px solid #ccc",
    borderBottom: "0.8px solid #ccc",
    borderTop: "0.8px solid #ccc",
    backgroundColor: getColor('background'),
    transition: "all 0.02s ease",
    justifyContent: "space-between",
    overflow: "hidden", // Ensures no overflow issues
  };

  return (
    // <Tooltip title={name} arrow placement="right">
      <Box
        component="div"
        sx={{
          width: "100%",
          height: "100%", // Ensure it takes full height of parent
          minHeight:'30px',
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", // Hide overflow at this level
          minWidth: 0, // Allow the box to shrink below its content size
        }}
      >
        <Box
          component="div"
          onDoubleClick={() => handelDoubleClick()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          sx={{
            ...(variant == "Floating" ? floatingBoxTheme : flatBoxTheme),
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            flexShrink: 0,
            overflow: "hidden",
            minWidth: 0, // Allows flex items to shrink below their minimum content size
          }}
        >
            <IconButton
            size="small"
            sx={{
              flexShrink: 0, // Prevent button from shrinking
              marginLeft: "8px",
              color: getColor('text'),
            }}
            onClick={(e: any) => {
              e.stopPropagation();
              setEnabled(node?.id ?? "", !isEnabled);
            }}
          >
            {isEnabled ? <Icon style={{fontSize:15}} icon="eva:radio-button-on-fill" />: <Icon style={{fontSize:15}} icon="eva:radio-button-off-outline" />}
          </IconButton>
          {icon && (
            <Icon icon={icon} style={{ flexShrink: 0, marginLeft:"5px" }} color={getColor('text')} />
          )}
          <Typography
            noWrap
            align="left"
            textAlign="left"
            alignContent="left"
            sx={{
              flexGrow: 1,
              flexShrink: 1,
              minWidth: 0, // Allows text to shrink
              color: getColor('text'),
              ...nonSelectableTextStyle,
              ml: 1,
              variant: isSelected ? "body2" : "body1",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </Typography>
          <Typography
            noWrap
            variant="body2"
            sx={{
              ...nonSelectableTextStyle,
              flexShrink: 1,
              minWidth: 0, // Allows text to shrink
              marginLeft: "10px",
              color: getColor('text'),
              variant: "body2",
              whiteSpace: "nowrap",
              overflow: "hidden",
              marginRight: children ? '0px' : '30px',
              textOverflow: "ellipsis",
              display: { xs: "none", sm: "block" }, // Responsive: hides on extra small screens
            }}
          >
            Qnt : {node?.children?.size ?? ""}
          </Typography>
          
        {children && <IconButton
        size="small"
        sx={{
            flexShrink: 0, // Prevent button from shrinking
            marginLeft: "8px",
            color: getColor('text'),
        }}
        onClick={(e: any) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
        }}
        >
        {isExpanded ? <Icon icon="system-uicons:minus" /> : <Icon icon="system-uicons:plus" />}
        </IconButton>}
        </Box>
        { isExpanded && children !== undefined && (
          <Box
            component="div"
            sx={{
              mt: 2,
              width: "100%",
              flexGrow: 1, // Allow this box to grow and fill remaining space
              overflowY: "auto", // Enable vertical scrolling
              overflowX: "hidden", // Hide horizontal scrollbar
            }}
          >
            {children}
          </Box>
        )}
      </Box>
    // </Tooltip>
  );
};

export default TreeTableRow;
