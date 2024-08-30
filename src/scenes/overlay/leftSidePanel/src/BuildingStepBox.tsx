import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../../../theme";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { ModelViewManager } from "../../../../bim-components/modelViewer";
import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { BuildingElement, GroupingType, SelectionGroup, VisibilityState } from "../../../../utilities/types";
import { GroupPanelProps } from "./StationBox";
import { TreeNode, TreeUtils } from "../../../../utilities/Tree";
import { zoomToBuildingElements } from "../../../../utilities/BuildingElementUtilities";
import { RiBox3Line } from "react-icons/ri";

export const BuildingStepBox: React.FC<GroupPanelProps> = ({ node }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [modelViewManager, setModelViewManager] = useState<ModelViewManager | undefined>();
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [childVisible, setChildVisible] = useState(false);
  const components = useComponentsContext();
  const treeNode = useRef<TreeNode<BuildingElement>>();
  const [name, setName] = useState<string | undefined>();
  const [elements, setElements] = useState<BuildingElement[]>();
  const [children, setChildren] = useState<TreeNode<BuildingElement>[]>();
  const [isVisible, setIsVisible] = useState<boolean>(
    node.id !== undefined && modelViewManager?.GroupVisibility?.get(node.id) !== VisibilityState.Hidden
  );

  useEffect(() => {
    if (!node) return;

    treeNode.current = node;
    setName(node.name);

    const foundElements = TreeUtils.getChildren(node, (child) => child.type === "BuildingElement");
    const t = foundElements.map((n) => n.data).filter((data): data is BuildingElement => data !== null);
    // console.log("Station group box has elements:", t);
    setElements(t);
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

  const handleVisibilityyUpdate = (data: Map<String, VisibilityState>) => {
    // console.log("handling visibility update:", data);
    if (!node.id) return;
    const visibilityState = data.get(node.id);

    if (visibilityState === undefined) return;

    setIsVisible(visibilityState !== VisibilityState.Hidden);
  };

  const handleSelectedGroupChanged = (data: SelectionGroup) => {
    setIsSelected(name === data.groupName);
  };

  const setSelected = () => {
    setIsSelected(true);
    if (modelViewManager?.SelectedGroup?.groupName === name || !modelViewManager || !elements || !name) return;

    modelViewManager.SelectedGroup = {
      id: node.id,
      groupType: node.type,
      groupName: name,
      elements: elements,
    };
    if (modelViewManager.GroupVisibility?.get(node.id) !== VisibilityState.Visible) ToggleVisibility();

    //todo highlight and zoom to selected
  };

  const ToggleVisibility = useCallback(() => {
    if (modelViewManager?.GroupVisibility && node.id) {
      console.log("Toggle visibility", modelViewManager.GroupVisibility);
      const currentVisibility = modelViewManager.GroupVisibility.get(node.id);
      const newVisState =
        currentVisibility === VisibilityState.Hidden ? VisibilityState.Visible : VisibilityState.Hidden;
      modelViewManager.setVisibility(node.id, newVisState, true);
      setIsVisible(newVisState !== VisibilityState.Hidden);
      // update visibility
    }
  }, [modelViewManager, name]);

  const handelDoubleClick = () => {
    setSelected();
    if (children) setChildVisible((prev) => !prev);
    if (!elements || !components) return;
    zoomToBuildingElements(elements, components);
  };

  const nonSelectableTextStyle = {
    userSelect: "none",
    WebkitUserSelect: "none", // For Safari
    MozUserSelect: "none", // For Firefox
    msUserSelect: "none", // For Internet Explorer/Edge
  };

  return (
    <>
      <Box key={name} component="div" style={{ marginBottom: "2px" }}>
        <Box
          component="div"
          onDoubleClick={() => handelDoubleClick()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          sx={{
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            padding: isHovered ? "8px" : "10px",
            width: isHovered ? "87%" : "80%",
            height: "30px",
            margin: "8px 0",
            borderRadius: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            border: isSelected ? "1px solid #ccc" : "none",
            backgroundColor: isHovered ? colors.primary[400] : colors.grey[900],
            transition: "all 0.3s ease",
            justifyContent: "space-between",
          }}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <RiBox3Line color={isSelected ? colors.primary[100] : colors.grey[500]} size="20px" />
          <Typography
            noWrap
            maxWidth={"150px"}
            variant={isSelected ? "h6" : "body2"}
            sx={{ flexGrow: 1, ...nonSelectableTextStyle, ml:1 }}
          >{`${treeNode.current?.type.toString()}: ${name}`}</Typography>
          <Typography
            color={colors.grey[500]}
            noWrap
            variant="body2"
            sx={{ marginLeft: "20px", ...nonSelectableTextStyle }}
          >
            el : {elements?.length}
          </Typography>
          <IconButton
            size="small"
            sx={{ marginLeft: "8px", color: colors.grey[700] }}
            onClick={(e) => {
              e.stopPropagation();
              ToggleVisibility();
            }}
          >
            {isVisible ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
          </IconButton>
        </Box>
      </Box>
    </>
  );
};

export default BuildingStepBox;
