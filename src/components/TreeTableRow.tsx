import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { ModelCache } from "../bim-components/modelCache";
import { useComponentsContext } from "../context/ComponentsContext";
import { nonSelectableTextStyle } from "../styles";
import { tokens } from "../theme";
import { GetFragmentIdMaps } from "../utilities/IfcUtilities";
import { TreeNode } from "../utilities/Tree";
import { BuildingElement, IfcElement, SelectionGroup, VisibilityState } from "../utilities/types";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import { ModelViewManager } from "../bim-components/modelViewer";
import { TreeUtils } from "../utilities/treeUtils";
import { convertToBuildingElement } from "../utilities/BuildingElementUtilities";

// todo: need to decide where the selection of elements will happen
// either here are with an update from the ModelViewManager

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

      const handleGroupVisibility = (data: { treeID: string; visibilityMap: Map<string, VisibilityState> }) =>
        getVisibilityState(data.treeID, data.visibilityMap);
      const handleSelectionChange = (data: SelectionGroup) => getSelectionState(data);

      modelViewManager.onGroupVisibilitySet.add(handleGroupVisibility);
      modelViewManager.onSelectedGroupChanged.add(handleSelectionChange);

      getVisibilityState(treeID, undefined);
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

    // const setVisibilityState = (treeID: string, nodeID: string, newVisState: VisibilityState) => {
    //   if (treeID !== treeID || !nodeID || !modelViewManager) return;
    //   // console.log('setting visibility state start')

    //   const tree = modelViewManager.getTree(treeID);
    //   if (!tree) return;

    //   const cacheVisState = tree.visibilityMap.get(nodeID);
    //   if (!cacheVisState) {
    //     console.log("TreeTable Row error updating vis state as no node and tree relationship found");
    //     return;
    //   }

    //   console.log("setting visibility state", cacheVisState, newVisState);

    //   if (cacheVisState === newVisState) return;
    //   // tree.visibilityMap.set(node.id, newVisState);
    //   modelViewManager.setVisibility(nodeID, treeID, newVisState, false);
    //   modelViewManager.onGroupVisibilitySet.trigger({ treeID: treeID, visibilityMap: tree.visibilityMap });
    // };

    const getVisibilityState = useCallback(
      (tID: string, visibilityMap: Map<string, VisibilityState> | undefined) => {
        if (treeID !== tID || !node?.id || !modelViewManager) return;

        const visState = visibilityMap
          ? visibilityMap.get(node.id)
          : modelViewManager.getTree(treeID)?.visibilityMap.get(node.id);

        setVisibility(visState);
        if (visState === undefined || visState === visibilityState) return;
        // modelViewManager.updateVisibility(treeID)
      },
      [treeID, node?.id, modelViewManager, visibilityState]
    );

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
      console.log("Double-clicked on node", node);

      // Call the function passed through props
      if (onClick) onClick(node);
    }, [node, components, onDoubleClick]);

    // // make visible on double click
    // const handleDoubleClick = useCallback(() => {
    //   if (!node || !components) return;
    //   console.log('double click')

    //   const cache = components.get(ModelCache);
    //   const elements = convertToBuildingElement(TreeUtils.getChildrenNonNullData(node));
    //   const idMaps = GetFragmentIdMaps(elements, components);

    //   if (!idMaps || !idMaps[0]) return;

    //   if (visibleOnDoubleClick) {
    //     elements.forEach((element) => {
    //       const frag = cache.getFragmentByElement(element);
    //       if (frag && frag.hiddenItems.has(element.expressID)) {
    //         frag.setVisibility(true, [element.expressID]);
    //       }
    //     });
    //   }

    //   const fragmentIdMap = getFragmentMapOfVisible(elements);

    //   //highlighter.highlightByID("select", fragmentIdMap, false, false, undefined);
    //   setSelected();

    // }, [node, components, visibleOnDoubleClick]);

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

    const boxTheme = useMemo(
      () => ({
        ...(variant === "Floating"
          ? {
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
              padding: isHovered ? "8px" : "10px",
              width: isHovered ? "95%" : "92%",
              borderRadius: "12px",
              margin: "4px 0",
              marginLeft: "8px",
              border: "0.8px solid #ccc",
            }
          : {
              padding: "0px",
              width: "100%",
              margin: "0px 0",
              borderBottom: "0.8px solid #ccc",
              borderTop: "0.8px solid #ccc",
            }),
        height: "30px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        borderColor: colors.grey[1000],
        backgroundColor: getColor("background"),
        transition: "all 0.1s ease",
        justifyContent: "space-between",
        overflow: "hidden",
      }),
      [variant, isHovered, colors, getColor]
    );

    const handleToggleExpand = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setIsExpanded((prev) => !prev);
    }, []);

    const defaultToggleVisibility = useCallback((node: TreeNode<IfcElement>) => {
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
    }, [treeID, visibilityState]);


    const handleToggleVisibility = onToggleVisibility || defaultToggleVisibility;

    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    return (
      <Box
        component="div"
        sx={{
          width: "100%",
          height: "100%",
          minHeight: "30px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <Box
          component="div"
          onDoubleClick={handleDoubleClick}
          onClick={(e) => {
            handleToggleExpand(e);
            handleClick();
            // modelViewManager.updateVisibility(treeID)
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={boxTheme}
        >
          <VisibilityToggle
            visibilityState={visibilityState}
            onClick={(e) => {
              if (!node) return;
              handleToggleVisibility(node);
              modelViewManager.updateVisibility(treeID);
            }}
            color={getColor("text")}
          />
          <RowContent
            name={name}
            icon={icon}
            getColor={getColor}
            node={node}
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

const RowContent: React.FC<RowContentProps> = React.memo(({ name, icon, getColor, node, childrenCount }) => (
  <>
    {icon && <Icon icon={icon} style={{ flexShrink: 0, marginLeft: "5px" }} color={getColor("text")} />}
    <Typography
      noWrap
      align="left"
      sx={{
        flexGrow: 1,
        flexShrink: 1,
        minWidth: 0,
        color: getColor("text"),
        ...nonSelectableTextStyle,
        ml: 1,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {name}
    </Typography>
    {childrenCount > 0 && (
      <Typography
        noWrap
        variant="body2"
        sx={{
          ...nonSelectableTextStyle,
          flexShrink: 1,
          minWidth: 0,
          marginLeft: "10px",
          color: getColor("text"),
          whiteSpace: "nowrap",
          overflow: "hidden",
          marginRight: childrenCount > 0 ? "30px" : "0px",
          textOverflow: "ellipsis",
          display: { xs: "none", sm: "block" },
        }}
      >
        Qnt : {childrenCount ?? ""}
      </Typography>
    )}
  </>
));

export default TreeTableRow;
