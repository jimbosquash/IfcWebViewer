import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Box, Chip, IconButton, Typography, useTheme } from "@mui/material";
import { ModelCache } from "../bim-components/modelCache";
import { useComponentsContext } from "../context/ComponentsContext";
import { tokens } from "../theme";
import { GetFragmentIdMaps } from "../utilities/IfcUtilities";
import { TreeNode } from "../utilities/Tree";
import { IfcElement, KnownGroupType, SelectionGroup, VisibilityState } from "../utilities/types";
import * as OBF from "@thatopen/components-front";
import { ModelViewManager } from "../bim-components/modelViewer";
import { TreeUtils } from "../utilities/treeUtils";
import { convertToBuildingElement } from "../utilities/BuildingElementUtilities";
import { RowContent } from "./RowContent";

export interface TreeTableRowProps {
  name: string;
  icon: string;
  treeID: string;
  node: TreeNode<IfcElement> | undefined;
  children?: React.ReactNode;
  customRowContent?: React.ReactNode;
  onDoubleClick?: (node: TreeNode<IfcElement>) => void; // The double-click handler
  onClick?: (node: TreeNode<IfcElement>) => void; // The double-click handler
  onToggleVisibility?: (node: TreeNode<IfcElement>) => void; // the toggle vis handler
  variant: "Floating" | "Flat";
}

export const TreeTableRow: React.FC<TreeTableRowProps> = React.memo(
  ({ name, node, icon, treeID, onToggleVisibility, variant, onDoubleClick, onClick, children, customRowContent }) => {
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

      const handleGroupVisibility = (data: { treeID: string }) =>
        getVisibilityState(data.treeID);
      const handleSelectionChange = (data: SelectionGroup) => getSelectionState(data);

      modelViewManager.onVisibilityUpdated.add(handleGroupVisibility);
      modelViewManager.onSelectedGroupChanged.add(handleSelectionChange);

      getVisibilityState(treeID);
      getSelectionState(modelViewManager.SelectedGroup);

      return () => {
        modelViewManager.onVisibilityUpdated.remove(handleGroupVisibility);
        modelViewManager.onSelectedGroupChanged.remove(handleSelectionChange);
      };
    }, [modelViewManager, treeID]);

    const getSelectionState = useCallback(
      (selectionGroup: SelectionGroup | undefined) => {
        setIsSelected(selectionGroup?.id === node?.id);

        // if any children are selected then expand
        if (selectionGroup && node?.children.has(selectionGroup?.id)) {
          setIsExpanded(true)
        } else {
          // setIsExpanded(false)
        }

      },
      [node?.id]
    );

    const getVisibilityState = (tID: string) => {
      if (treeID !== tID || !node?.id || !modelViewManager) return;

      const visState = modelViewManager.getTree(treeID)?.getVisibility(node.id);
      console.log('getting vis state', node.id, visState)

      setVisibility(visState);
      if (visState === undefined || visState === visibilityState) return;
    };

    // Function to get dynamic MUI Chips based on conditions
    const getChips = useMemo(() => {
      const chips = [];
      if (node?.children?.size) {
        const assemblies = [...node.children.values()].filter(child => child.type === KnownGroupType.Assembly)
        if (assemblies.length > 0) {
          chips.push(<Chip key="assemblies" label={`${assemblies.length} Assemblies`} size="small" />);
        }
      }

      return chips;
    }, [node]);

    // Local double-click handler that delegates to the passed-in function
    const handleDoubleClick = useCallback(() => {
      if (!node || !components) return;

      // Log the double-click for debugging
      console.log("Double-clicked on node", node);

      // Call the function passed through props
      if (onDoubleClick) onDoubleClick(node);
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

        const newState = visibilityState === VisibilityState.Visible ? VisibilityState.Hidden : VisibilityState.Visible;


        modelViewManager.setVisibilityState(
          treeID,
          node.id,
          newState,
          true
        );
        console.log('treeRow default visibility toggle', node.id)

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
          maxWidth: "100%", // Prevent row from exceeding container width

          justifyContent: "space-between",
          overflow: "hidden",
          cursor: "pointer",
          display: "flex",
          minHeight: "30px",

          flexDirection: "column",
          minWidth: 0,
          boxSizing: "border-box", // Include padding in width
          ...getParentBoxTheme(variant),

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

          sx={{
            ...getRowTheme(variant),
            backgroundColor: getColor('background'),
            color: getColor('text'),
            justifyContent: "flex-start",
            overflow: "hidden",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            minheight: "30px",
          }}
        >

          {/* Visibility Toggle */}
          <IconButton
            size="small"
            sx={{ color: "inherit", flexShrink: 0 }} // Prevent icon from shrinking
            onClick={(e) => {
              if (node) {
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

          {customRowContent ? customRowContent : <RowContent
            name={name}
            icon={icon}
            node={node}
            chips={getChips}
          />}

          {children && (
            <IconButton
              size="small"
              sx={{ flexShrink: 0, marginLeft: "8px", color: "inherit" }}
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
              overflowY: "hidden",
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

// Helper function to get box styling for different states
const getRowTheme = (variant: "Floating" | "Flat") => ({
  padding: variant === "Floating" ? "8px" : "0px",
  transition: "all 0.1s ease",
  borderBottom: variant !== "Floating" ? "0.8px solid #ccc" : "",
  borderTop: variant !== "Floating" ? "0.8px solid #ccc" : "",

});


const getParentBoxTheme = (variant: "Floating" | "Flat") => ({
  boxShadow: variant === "Floating" ? "0 0 10px rgba(0, 0, 0, 0.1)" : "",
  borderRadius: variant === "Floating" ? "12px" : '',
  border: variant === "Floating" ? "0.8px solid #ccc" : "",
  transition: "all 0.1s ease",
  borderBottom: variant !== "Floating" ? "0.8px solid #ccc" : "",
  borderTop: variant !== "Floating" ? "0.8px solid #ccc" : "",
  // marginRight: variant === "Floating" ? "12px" : "",
  marginTop: variant === "Floating" ? "4px" : "",


});

export default TreeTableRow;
