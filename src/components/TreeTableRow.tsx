import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Box, Chip, IconButton, Typography, useTheme } from "@mui/material";
import { ModelCache } from "../bim-components/modelCache";
import { useComponentsContext } from "../context/ComponentsContext";
import { nonSelectableTextStyle } from "../styles";
import { tokens } from "../theme";
import { GetFragmentIdMaps } from "../utilities/IfcUtilities";
import { TreeNode } from "../utilities/Tree";
import { IfcElement, KnownGroupType, SelectionGroup, VisibilityState } from "../utilities/types";
import * as OBF from "@thatopen/components-front";
import { ModelViewManager } from "../bim-components/modelViewer";
import { TreeUtils } from "../utilities/treeUtils";
import { convertToBuildingElement } from "../utilities/BuildingElementUtilities";

export interface TreeTableRowProps {
  name: string;
  icon: string;
  treeID: string;
  node: TreeNode<IfcElement> | undefined;
  children?: React.ReactNode;
  onDoubleClick: (node: TreeNode<IfcElement>) => void; // The double-click handler
  onClick?: (node: TreeNode<IfcElement>) => void; // The double-click handler
  onToggleVisibility?: (node: TreeNode<IfcElement>) => void; // the toggle vis handler
  variant: "Floating" | "Flat";
}

export const TreeTableRow: React.FC<TreeTableRowProps> = React.memo(
  ({ name, node, icon, treeID, onToggleVisibility, variant, onDoubleClick, onClick, children }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const components = useComponentsContext();
    const [isHovered, setIsHovered] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [visibilityState, setVisibility] = useState<VisibilityState>();

    const modelViewManager = useMemo(() => components?.get(ModelViewManager), [components]);

    // when ModelVIewManager updates its vismap of parent tree check on visibility state

    useEffect(() => {
      if (!modelViewManager) return;

      const handleGroupVisibility = (data: { treeID: string}) =>
        getVisibilityState(data.treeID);
      const handleSelectionChange = (data: SelectionGroup) => getSelectionState(data);

      modelViewManager.onGroupVisibilitySet.add(handleGroupVisibility);
      modelViewManager.onSelectedGroupChanged.add(handleSelectionChange);

      getVisibilityState(treeID);
      getSelectionState(modelViewManager.SelectedGroup);

      return () => {
        modelViewManager.onGroupVisibilitySet.remove(handleGroupVisibility);
        modelViewManager.onSelectedGroupChanged.remove(handleSelectionChange);
      };
    }, [modelViewManager, treeID]);

    const getSelectionState = useCallback(
      (selectionGroup: SelectionGroup | undefined) => {
        setIsSelected(selectionGroup?.id === node?.id);
      },
      [node?.id]
    );

    const getVisibilityState = useCallback(
      (tID: string) => {
        if (treeID !== tID || !node?.id || !modelViewManager) return;

        const visState = modelViewManager.getTree(treeID)?.getVisibility(node.id);

        setVisibility(visState);
        if (visState === undefined || visState === visibilityState) return;
        // modelViewManager.updateVisibility(treeID)
      },
      [treeID, node?.id, modelViewManager, visibilityState]
    );

    // Function to get dynamic MUI Chips based on conditions
    const getChips = useMemo(() => {
      const chips = [];
      if (node?.children?.size) {
        const assemblies = [...node.children.values()].filter(child => child.type === KnownGroupType.Assembly)
        if(assemblies.length > 0){
        chips.push(<Chip key="assemblies" label={`${assemblies.length} Assemblies`} size="small" />);}
      }

      return chips;
    }, [node]);

    // Local double-click handler that delegates to the passed-in function
    const handleDoubleClick = useCallback(() => {
      if (!node || !components) return;

      // Log the double-click for debugging
      console.log("Double-clicked on node", node);

      // Call the function passed through props
      onDoubleClick(node);
    }, [node, components, onDoubleClick]);

    // Local click handler that delegates to the passed-in function
    const handleClick = useCallback(() => {
      if (!node || !components) return;

      // Log the double-click for debugging
      console.log("clicked on node", node);

      // Call the function passed through props
      if (onClick) onClick(node);
    }, [node, components, onDoubleClick]);

    // on hover changed highlight all elements in the node
    useEffect(() => {
      if (!node || !components) return;

      const highlighter = components.get(OBF.Highlighter);
      const elements = convertToBuildingElement(TreeUtils.getChildrenNonNullData(node));
      const idMaps = GetFragmentIdMaps(elements, components);

      if (!idMaps || !idMaps[0]) return;

      if (isHovered) {
        highlighter.highlightByID("hover", idMaps[0], true, false, undefined);
      } else {
        highlighter.clear("hover");
      }

      return () => {
        highlighter.clear("hover");
      };
    }, [isHovered, node, components]);

    const getColor = useCallback(
      (element: "text" | "background") => {
        if (isSelected) {
          return element === "text" ? colors.primary[100] : colors.blueAccent[700];
        }
        if (visibilityState !== VisibilityState.Visible && !isHovered) {
          return element === "text" ? colors.grey[600] : colors.primary[100];
        }
        if (isHovered) {
          return element === "text" ? colors.grey[400] : colors.blueAccent[800];
        }
        return element === "background" ? colors.grey[1000] : colors.grey[500];
      },
      [visibilityState, isHovered, colors]
    );

    const handleToggleExpand = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setIsExpanded((prev) => !prev);
    }, []);

    const defaultToggleVisibility = useCallback(
      (node: TreeNode<IfcElement>) => {
        // e.stopPropagation();
        if (!node) return;

        modelViewManager.setVisibilityState(
          treeID,
          node.id,
          visibilityState === VisibilityState.Visible ? VisibilityState.Hidden : VisibilityState.Visible
        );

        if (node) {
          const elements = convertToBuildingElement(TreeUtils.getChildrenNonNullData(node));
          const cache = components.get(ModelCache);

          elements.forEach((element) => {
            const frag = cache.getFragmentByElement(element);
            if (!frag) return;
            frag.setVisibility(visibilityState === VisibilityState.Hidden, [element.expressID]);
          });
        }
      },
      [treeID, visibilityState]
    );

    const handleToggleVisibility = onToggleVisibility || defaultToggleVisibility;
    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    return (
      <Box
        component="div"
        sx={{
          width: "100%",
          height: "100%",
          ...getParentBoxTheme(isHovered, isExpanded, variant, colors)
        }}
      >
        <Box
          component="div"
          onDoubleClick={handleDoubleClick}
          onClick={(e) => {
            handleToggleExpand(e);
            handleClick();
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={{ ...getRowTheme(isHovered, isExpanded, variant, colors) }}
        >
          {/* <VisibilityToggle
            visibilityState={visibilityState}
            onClick={(e) => {
              if (!node) return;
              handleToggleVisibility(node);
              modelViewManager.updateVisibility(treeID);
            }}
            color={getColor("text")}
          /> */}
          {/* Visibility Toggle */}
          <IconButton
            size="small"
            onClick={(e) => {
              if (node){
                 handleToggleVisibility(node);
                 modelViewManager.updateVisibility(treeID);
                }
            }}
          >
            <Icon
              icon={
                visibilityState === VisibilityState.Visible
                  ? "eva:radio-button-on-fill"
                  : "eva:radio-button-off-outline"
              }
            />
          </IconButton>
          <RowContent
            name={name}
            icon={icon}
            getColor={getColor}
            node={node}
            chips={getChips}
            childrenCount={node?.children?.size ?? 0}
          />
          {children && (
            <IconButton
              size="small"
              sx={{ flexShrink: 0, marginLeft: "8px", color: getColor("text") }}
              onClick={(e) => {
                e.stopPropagation(); // Stop the click from reaching the row
                handleToggleExpand(e);
              }}
            >
              <Icon icon={isExpanded ? "system-uicons:minus" : "system-uicons:plus"} />
            </IconButton>
          )}
        </Box>
        {isExpanded && children && (
          <Box
            component="div"
            sx={{
              mt: 2,
              width: "100%",
              flexGrow: 1,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {children}
          </Box>
        )}
        
      </Box>
    );
  }
);

export interface visibilityToggleProps {
  visibilityState: VisibilityState | undefined;
  onClick: (e: React.MouseEvent) => void;
  color: string;
}

export interface expandToggleProps {
  isExpanded: boolean;
  onClick: (e: React.MouseEvent) => void;
  color: string;
}

export interface RowContentProps {
  name: string;
  icon: string;
  getColor: (element: "text" | "background") => string;
  node: TreeNode<IfcElement> | undefined;
  childrenCount: number;
  chips?: React.ReactNode[]; // An array of chips (optional), passed as React elements
}

const VisibilityToggle: React.FC<visibilityToggleProps> = React.memo(({ visibilityState, onClick, color }) => (
  <IconButton size="small" sx={{ flexShrink: 0, marginLeft: "8px", color }} onClick={onClick}>
    <Icon
      style={{ fontSize: 15 }}
      icon={visibilityState === VisibilityState.Visible ? "eva:radio-button-on-fill" : "eva:radio-button-off-outline"}
    />
  </IconButton>
));

const ExpandToggle: React.FC<expandToggleProps> = React.memo(({ isExpanded, onClick, color }) => (
  <IconButton
    size="small"
    sx={{ flexShrink: 0, marginLeft: "8px", color }}
    onClick={(e) => {
      e.stopPropagation(); // Stop the click from reaching the row
      onClick(e);
    }}
  >
    <Icon icon={isExpanded ? "system-uicons:minus" : "system-uicons:plus"} />
  </IconButton>
));

// RowContent component to display name, icon, and any chips passed
const RowContent: React.FC<RowContentProps> = ({ name, icon, node, chips, childrenCount }) => (
  <Box component="div" display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
    {icon && <Icon icon={icon} style={{ marginLeft: "5px" }} />}
    <Typography
      noWrap
      sx={{
        flexGrow: 1,
        flexShrink: 1,
        minWidth: 0,
        ...nonSelectableTextStyle,
        ml: 1,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {name}
    </Typography>

    {/* Box for chips: takes full available space and aligns chips to the right */}
    <Box component="div" display="flex" alignItems="center" justifyContent="flex-end" sx={{ flexGrow: 1 }}>
      {chips?.map((chip, index) => (
        <Box component="div" key={index} sx={{ ml: 1 }}>
          {" "}
          {/* Optional spacing between chips */}
          {chip}
        </Box>
      ))}
    </Box>
  </Box>
);

// Helper function to get box styling for different states
const getRowTheme = (isHovered: boolean, isExpanded: boolean, variant: "Floating" | "Flat", colors: any) => ({
  padding: variant === "Floating" ? "8px" : "0px",
  backgroundColor: isHovered ? colors.blueAccent[800] : colors.grey[1000],
  transition: "all 0.1s ease",
  borderBottom: variant !== "Floating" ? "0.8px solid #ccc" : "",
  borderTop: variant !== "Floating" ? "0.8px solid #ccc" : "",
  // margin: variant === "Floating" ? "4px" : "",
  justifyContent: "space-between",
  overflow: "hidden",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  minheight: "30px",

});


const getParentBoxTheme = (isHovered: boolean, isExpanded: boolean, variant: "Floating" | "Flat", colors: any) => ({
  boxShadow: variant === "Floating" ? "0 0 10px rgba(0, 0, 0, 0.1)" : "",
  // padding: variant === "Floating" ? "8px" : "0px",
  borderRadius: variant === "Floating" ? "12px" : '',
  border: variant === "Floating" ? "0.8px solid #ccc" : "",
  backgroundColor: isHovered ? colors.blueAccent[800] : colors.grey[1000],
  transition: "all 0.1s ease",
  borderBottom: variant !== "Floating" ? "0.8px solid #ccc" : "",
  borderTop: variant !== "Floating" ? "0.8px solid #ccc" : "",
  // marginRight: variant === "Floating" ? "12px" : "",
  marginTop: variant === "Floating" ? "4px" : "",
  justifyContent: "space-between",
  overflow: "hidden",
  cursor: "pointer",
  display: "flex",
  minHeight: "30px",

  flexDirection: "column",
  minWidth: 0,

});

// const getColor = useCallback(
//   (element: "text" | "background") => {
//     if (isSelected) {
//       return element === "text" ? colors.primary[100] : colors.blueAccent[700];
//     }
//     if (visibilityState !== VisibilityState.Visible && !isHovered) {
//       return element === "text" ? colors.grey[600] : colors.primary[100];
//     }
//     if (isHovered) {
//       return element === "text" ? colors.grey[400] : colors.blueAccent[800];
//     }
//     return element === "background" ? colors.grey[1000] : colors.grey[500];
//   },
//   [visibilityState, isHovered, colors]
// );

// const boxTheme = useMemo(
//   () => ({
//     ...(variant === "Floating"
//       ? {
//           boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
//           padding: isHovered ? "8px" : "10px",
//           width: isHovered ? "95%" : "92%",
//           borderRadius: "12px",
//           margin: "4px 0",
//           marginLeft: "8px",
//           border: "0.8px solid #ccc",
//         }
//       : {
//           padding: "0px",
//           width: "100%",
//           margin: "0px 0",
//           borderBottom: "0.8px solid #ccc",
//           borderTop: "0.8px solid #ccc",
//         }),

//     borderColor: colors.grey[1000],
//     backgroundColor: getColor("background"),

//   }),
//   [variant, isHovered, colors, getColor]
// );

export default TreeTableRow;
