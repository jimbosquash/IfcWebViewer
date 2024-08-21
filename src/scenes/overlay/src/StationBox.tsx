import { Box, Typography, IconButton, useTheme } from "@mui/material";
import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import { tokens } from "../../../theme";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import BuildingStepBox from "./BuildingStepBox";
import { zoomToSelected } from "../../../utilities/BuildingElementUtilities";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useComponentsContext } from "../../../context/ComponentsContext";
import { ModelViewManager } from "../../../bim-components/modelViewer";
import { BuildingElement, KnowGroupType, SelectionGroup, VisibilityState } from "../../../utilities/types";
import { TreeNode, TreeUtils } from "../../../utilities/Tree";
import { nonSelectableTextStyle } from "../../../styles";
import { BsBoxes, BsFileMinus, BsPlus } from "react-icons/bs";
import { PlusOne } from "@mui/icons-material";
import { PiMinus, PiPlus } from "react-icons/pi";

export interface GroupPanelProps {
  node: TreeNode<BuildingElement>;
}

const StationBox: React.FC<GroupPanelProps> = ({ node }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [childVisible, setChildVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [name, setName] = useState<string | undefined>();
  const [elements, setElements] = useState<BuildingElement[]>();
  const [children, setChildren] = useState<TreeNode<BuildingElement>[]>();
  const [modelViewManager, setModelViewManager] = useState<ModelViewManager | undefined>();
  const [isVisible, setIsVisible] = useState<boolean>(
    node.id !== undefined && modelViewManager?.GroupVisibility?.get(node.id) !== VisibilityState.Hidden
  );

  const treeNode = useRef<TreeNode<BuildingElement>>();

  useEffect(() => {
    if (!modelViewManager) return;
    const visState = modelViewManager.GroupVisibility?.get(node.id);
    if (visState === VisibilityState.Visible) setIsVisible(true);
    else setIsVisible(false);
  });

  useEffect(() => {
    if (!node) return;

    treeNode.current = node;
    setName(node.name);

    const foundElements = TreeUtils.getChildren(node, (child) => child.type === "BuildingElement");
    const t = foundElements.map((n) => n.data).filter((data): data is BuildingElement => data !== null);
    // console.log("Station group box has elements:", t);
    setElements(t);


    const validChildren = Array.from(node.children.values()).filter(
      (n) => n.type !== KnowGroupType.BuildingElement.toString()
    );


    if (validChildren.length > 1) {
      console.log("setting up children:", validChildren)

      setChildren(validChildren);
    }
    else setChildren(undefined);
  }, [node]);

  useEffect(() => {
    if (!components) return;
    const viewManager = components.get(ModelViewManager);
    viewManager.onGroupVisibilitySet.add((data) => handleVisibilityyUpdate(data));
    viewManager.onSelectedGroupChanged.add((data) => handleSelectedGroupChanged(data));
    setModelViewManager(viewManager);
    if (name) setIsVisible(modelViewManager?.GroupVisibility?.get(name) !== VisibilityState.Hidden);

    return () => {
      viewManager.onGroupVisibilitySet.remove((data) => handleVisibilityyUpdate(data));
      viewManager.onSelectedGroupChanged.remove((data) => handleSelectedGroupChanged(data));
    };
  }, [components]);

  // useEffect(() => {
  //   if (!modelViewManager?.Tree || !elements) return;
  //   const steps = groupElementsByProperty(elements, "BuildingStep");
  //   console.log("stationbox: getting children", steps);
  // }, [modelViewManager?.Tree, elements]);

  const toggleChildVisibility = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setChildVisible((prev) => !prev);
    },
    [modelViewManager, name]
  );

  const handleSelectedGroupChanged = (data: SelectionGroup) => {
    setIsSelected(name === data.groupName);
    if(name === data.groupName) console.log("stationbox: setting selected:", name, name === data.groupName);
  };

  const handleVisibilityyUpdate = (data: Map<String, VisibilityState>) => {
    // console.log("stationbox: handling visibility update:", data);
    if (!node.id) return;
    const visibilityState = data.get(node.id);

    if (visibilityState === undefined) return;

    setIsVisible(visibilityState !== VisibilityState.Hidden);
  };

  const ToggleVisibility = useCallback(() => {
    if (modelViewManager?.GroupVisibility && node.id) {
      // console.log("Toggle visibility", modelViewManager.GroupVisibility);
      const currentVisibility = modelViewManager.GroupVisibility.get(node.id);
      const newVisState =
        currentVisibility === VisibilityState.Hidden ? VisibilityState.Visible : VisibilityState.Hidden;
      modelViewManager.setVisibility(node.id, newVisState, true);
      setIsVisible(newVisState !== VisibilityState.Hidden);
      // update visibility
    }
  }, [modelViewManager, name]);

  const setSelected = () => {
    setIsSelected(true);
    if (modelViewManager?.SelectedGroup?.groupName === name || !modelViewManager || !elements || !name) {
     console.log('set selection but returning early')
      return;
    }
    modelViewManager.SelectedGroup = {
      id: node.id,
      groupType: "Station",
      groupName: name,
      elements: elements,
    };
    if (modelViewManager.GroupVisibility?.get(node.id) !== VisibilityState.Visible) ToggleVisibility();

    //todo highlight and zoom to selected
  };

  const displayName = name?.startsWith("Prefab -") ? name.slice("Prefab -".length) : name;

  const handelDoubleClick = () => {
    setSelected();
    if (children) setChildVisible((prev) => !prev);
    if (!elements || !components) return;
    zoomToSelected(elements, components);
    // ToggleVisibility();
    if(modelViewManager?.SelectedGroup)
      modelViewManager?.select(modelViewManager?.SelectedGroup);
  };



  return (
    <Box component="div">
      <Box
        component="div"
        onDoubleClick={() => handelDoubleClick()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          padding: isHovered ? "8px" : "10px",
          width: isHovered ? "255px" : "250px",
          height: "35px",
          margin: "8px 0",
          borderRadius: "12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          border: isSelected ? "1px solid #ccc" : "none",
          backgroundColor: isSelected ? colors.blueAccent[600] : colors.grey[900],
          transition: "all 0.2s ease",
          justifyContent: "space-between",
        }}
      >
        <BsBoxes color={isSelected ? colors.primary[100] : colors.grey[500]} size="10"/>
        <Typography
          noWrap
          maxWidth="105px"
          color={isSelected ? colors.primary[100] : colors.grey[600]}
          variant={isSelected ? "h6" : "body2"}
          sx={{ flexGrow: 1, ...nonSelectableTextStyle, ml:1, alignContent:"left" }}
        >
          {displayName}
        </Typography>
        <Typography
          color={isSelected ? colors.primary[100] : colors.grey[600]}
          noWrap
          variant="body2"
          sx={{ marginLeft: "10px", ...nonSelectableTextStyle }}
        >
          el : {elements?.length}
        </Typography>
        <IconButton
          size="small"
          color={isSelected ? "primary" : "secondary"}
          sx={{ marginLeft: "8px", color: isSelected ? colors.primary[100] : colors.grey[500] }}
          onClick={(e: any) => {
            e.stopPropagation();
            ToggleVisibility();
          }}
        >
          {isVisible ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
        </IconButton>
        {children && (
          <IconButton size="small" sx={{ marginLeft: "4px", color: isSelected ? colors.primary[100] : colors.grey[500] }} onClick={toggleChildVisibility}>
            {childVisible ? <PiMinus /> : <PiPlus />}
          </IconButton>
        )}
      </Box>
      {childVisible && children && (
        <Box component="div" sx={{ marginLeft: "5px", marginTop: "10px" }}>
          {children.map((node) => (
            <BuildingStepBox key={node.id} node={node} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default StationBox;
