import { Box, ButtonGroup, IconButton, useTheme } from "@mui/material";
import { useContext } from "react";
import { tokens } from "../../theme";
import * as OBC from "@thatopen/components";
import TocIcon from "@mui/icons-material/Toc";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import ZoomInMapOutlined from "@mui/icons-material/ZoomInMapOutlined";
import {
  GetAdjacentGroup, SelectionGroup,
} from "../../utilities/BuildingElementUtilities";
import { ComponentsContext } from "../../context/ComponentsContext";
import { CommentIconButton } from "./src/commentIconButton";
import { ModelViewManager } from "../../bim-components/modelViewer";

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

  const setAdjacentGroup = (adjacency: "previous" | "next") => {
    console.log()
    if(!components) return;

    const viewManager = components.get(ModelViewManager);

    const current = viewManager.SelectedGroup;


    if (!viewManager.Groups) return;

    if (!current) {
      console.log("No group selected, default will be used");
    }
    const newGroup = GetAdjacentGroup(current, viewManager.Groups,adjacency);
    if (newGroup) {
      const visMap = IsolateSelected(components, newGroup);

      viewManager.GroupVisibility = visMap;
      viewManager.SelectedGroup = newGroup;

      // set up
    }
  };

  const IsolateSelected = (components : OBC.Components,selected: SelectionGroup) => {
    const viewManager = components.get(ModelViewManager);
    const visMap = new Map(viewManager.GroupVisibility);
    visMap.forEach((visState, groupName) => visMap.set(groupName, true));
    const matchingGroupType = viewManager.Groups?.get(selected.groupType)?.keys();
    if (!matchingGroupType) return;

    for (let groupName of Array.from(matchingGroupType)) {
      if (groupName !== selected.groupName) visMap.set(groupName, false);
    }
    return visMap;
  }

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
            {/* <IconButton
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
            </IconButton> */}
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
