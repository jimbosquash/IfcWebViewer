import { Box, ButtonGroup, IconButton, useTheme } from "@mui/material";
import { useContext } from "react";
import { tokens } from "../../theme";
import TocIcon from "@mui/icons-material/Toc";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import ZoomInMapOutlined from "@mui/icons-material/ZoomInMapOutlined";
import {
  GetAdjacentGroup,
  GetNextGroup,
} from "../../utilities/BuildingElementUtilities";
import { ComponentsContext } from "../../context/ComponentsContext";
import { useModelContext } from "../../context/ModelStateContext";
import { CommentIconButton } from "./src/commentIconButton";

interface floatingButtonProps {
  togglePropertyPanelVisibility: () => void;
  toggleGroupsPanelVisibility: () => void;
}

const FloatingButtonGroup = ({
  togglePropertyPanelVisibility,
  toggleGroupsPanelVisibility,
}: floatingButtonProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useContext(ComponentsContext);
  const {
    currentWorld,
    selectedGroup,
    groups,
    setSelectedGroup,
    groupVisibility,
    setGroupVisibility,
  } = useModelContext();

  const setNextGroup = () => {
    if (!groups) return;

    if (!selectedGroup) {
      console.log("No group selected, default will be used");
    }
    const nextGroup = GetNextGroup(selectedGroup, groups);
    if (nextGroup) {
      console.log("Next group found and setting", nextGroup);

      setSelectedGroup(nextGroup);

      const visMap = new Map(groupVisibility);
      visMap.forEach((visState, groupName) => visMap.set(groupName, true));
      const matchingGroupType = groups.get(nextGroup.groupType)?.keys();
      if (!matchingGroupType) return;

      for (let groupName of Array.from(matchingGroupType)) {
        if (groupName !== nextGroup.groupName) visMap.set(groupName, false);
      }
      console.log("new vis map set", visMap);
      setGroupVisibility(visMap);
    }
  };

  const setAdjacentGroup = (adjacency: "previous" | "next") => {
    if (!groups) return;

    if (!selectedGroup) {
      console.log("No group selected, default will be used");
    }
    const previousGroup = GetAdjacentGroup(selectedGroup, groups,adjacency);
    if (previousGroup) {
      console.log("group found and setting", previousGroup);

      setSelectedGroup(previousGroup);

      const visMap = new Map(groupVisibility);
      visMap.forEach((visState, groupName) => visMap.set(groupName, true));
      const matchingGroupType = groups.get(previousGroup.groupType)?.keys();
      if (!matchingGroupType) return;

      for (let groupName of Array.from(matchingGroupType)) {
        if (groupName !== previousGroup.groupName) visMap.set(groupName, false);
      }
      console.log("new vis map set", visMap);
      setGroupVisibility(visMap);
    }
  };

  const setPreviousGroup = () => {
    if (!groups) return;

    if (!selectedGroup) {
      console.log("No group selected, default will be used");
    }
    const previousGroup = GetAdjacentGroup(selectedGroup, groups,"previous");
    if (previousGroup) {
      console.log("group found and setting", previousGroup);

      setSelectedGroup(previousGroup);

      const visMap = new Map(groupVisibility);
      visMap.forEach((visState, groupName) => visMap.set(groupName, true));
      const matchingGroupType = groups.get(previousGroup.groupType)?.keys();
      if (!matchingGroupType) return;

      for (let groupName of Array.from(matchingGroupType)) {
        if (groupName !== previousGroup.groupName) visMap.set(groupName, false);
      }
      console.log("new vis map set", visMap);
      setGroupVisibility(visMap);
    }
  };

  return (
    <>
      <Box component={"div"}>
        <div
          style={{
            position: "fixed",
            bottom: 50,
            left: "40%",
            transform: "translateX(-50%,0)",
            zIndex: 500,
            width: 450,
            height: 35,
            cursor: "grab",
            display: "inline-block",
          }}
        >
          <ButtonGroup
            variant="contained"
            style={{ backgroundColor: colors.primary[400] }}
          >
            <div>{/* <DragIndicatorIcon /> */}</div>
            
            <IconButton
              style={floatingButtonStyle}
              onClick={() =>
                toggleGroupsPanelVisibility()
              }
            >
              <TocIcon fontSize="medium" />
            </IconButton>
            <IconButton
              style={floatingButtonStyle}
              onClick={() => togglePropertyPanelVisibility()}
            >
              <DescriptionOutlined fontSize="small" />
            </IconButton>
            <IconButton
              style={floatingButtonStyle}
              onClick={() => {
                if (components && currentWorld) {
                  setTimeout(async () => {
                    if (currentWorld?.meshes)
                      currentWorld.camera.fit(currentWorld?.meshes, 0.5);
                  }, 50);
                }
              }}
            >
              <ZoomInMapOutlined fontSize="small" />
            </IconButton>
            <IconButton style={floatingButtonStyle} onClick={ () => setAdjacentGroup("previous")}>
              <NavigateBeforeIcon fontSize="large" />
            </IconButton>
            <IconButton style={floatingButtonStyle} onClick={ () => setAdjacentGroup("next")}>
              <NavigateNextIcon fontSize="large" />
            </IconButton>
            <CommentIconButton />
          </ButtonGroup>
        </div>
      </Box>
    </>
  );
};

const floatingButtonStyle = {
  display: "flex",
  alignItems: "center",
  padding: "12px",
  fontSize: "small",
};

export default FloatingButtonGroup;
