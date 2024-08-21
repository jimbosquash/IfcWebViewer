import { Box, Button, ButtonGroup, Divider, IconButton, Tooltip, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { tokens } from "../../theme";
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Group from "@mui/icons-material/Group";
import ViewArray from "@mui/icons-material/ViewArray";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import ZoomInMapOutlined from "@mui/icons-material/ZoomInMapOutlined";
import { GetAdjacentGroup } from "../../utilities/BuildingElementUtilities";
import { useComponentsContext } from "../../context/ComponentsContext";
import { CommentIconButton } from "./src/commentIconButton";
import { ModelViewManager } from "../../bim-components/modelViewer";
import { ModelCache } from "../../bim-components/modelCache";
import { SelectionGroup, VisibilityMode } from "../../utilities/types";
import CameraButton from "./src/cameraButton";
import { VisibilityPropertiesButton } from "./src/visibilityPropertiesButton";
import { PlanViewButton } from "./src/planViewButton";

interface floatingButtonProps {
  togglePropertyPanelVisibility: () => void;
  toggleGroupsPanelVisibility: () => void;
}

const FloatingButtonGroup = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>();

  useEffect(() => {
    if (!components) return;

    const viewManager = components.get(ModelViewManager);
    if (!viewManager) return;

    viewManager.onVisibilityModeChanged.add(handelVisibilityModeChange);

    return () => {
      viewManager.onVisibilityModeChanged.remove(handelVisibilityModeChange);
    };
  }, [components]);

  const setAdjacentGroup = async (adjacency: "previous" | "next") => {
    console.log();
    if (!components) return;

    const viewManager = components.get(ModelViewManager);

    const current = viewManager.SelectedGroup;

    if (!current) {
      console.log("No group selected, default will be used");
    }
    // console.log("Setting adjacent",current);

    const newGroup = GetAdjacentGroup(current, viewManager.Tree, adjacency);

    if (newGroup) {
      try {
        await updateVisibility(viewManager, newGroup);
        viewManager.SelectedGroup = newGroup;
        //zoomToSelected(viewManager.getBuildingElements(newGroup.id),components);
      } catch (error) {
        console.error("Error updating visibility:", error);
        // Handle the error appropriately (e.g., show an error message to the user)
      }
    }
  };
  // set up visibility map depending on mode setting

  const updateVisibility = async (viewManager: ModelViewManager, group: SelectionGroup) => {
    try {
      if (viewManager.VisibilityMode === VisibilityMode.Isolate) {
        IsolateSelected(viewManager.components, group);
      }
      if (viewManager.VisibilityMode === VisibilityMode.Passive) {
        viewManager.SequentiallyVisible(group);
        await viewManager.select(group);
      }
    } catch (error) {
      console.error("Error updating visibility:", error);
    }
  };

  const handelVisibilityModeChange = () => {
    const viewManager = components?.get(ModelViewManager);
    if (!viewManager) return;

    viewManager.VisibilityMode;
    setVisibilityMode(viewManager.VisibilityMode);
  };

  const IsolateSelected = (components: OBC.Components, selected: SelectionGroup) => {
    const viewManager = components.get(ModelViewManager);
    viewManager.isolate(selected);
  };

  const setCamView = () => {
    const cache = components?.get(ModelCache);
    if (!cache?.world) return;

    let cam = cache.world.camera as OBC.OrthoPerspectiveCamera;
    cam.projection.set("Orthographic");
    cam.set("Plan" as OBC.NavModeID);

    const bbox = new THREE.Box3().setFromObject(cache.world.scene.three);
    const center = bbox.getCenter(new THREE.Vector3());
    const size = bbox.getSize(new THREE.Vector3());
    // console.log("cam bbox center:", center.x,center.y,center.z);

    // Calculate the larger of width and depth for optimal framing
    const maxSize = Math.max(size.x, size.z);

    // Set camera position
    const cameraHeight = Math.max(size.y, maxSize) * 2; // Ensure camera is high enough
    cam.controls.setPosition(center.x, center.y + cameraHeight, center.z, false);
    console.log("cam position center:", center.x, center.y + cameraHeight, center.z);

    // Set camera target to look at the center
    cam.controls.setTarget(center.x, center.y, center.z, false);
    console.log("cam target center:", center.x, center.y, center.z);

    // cam.controls.up

    // cam.fit(cache.world?.meshes, 0.5);
    // console.log("cam mode setting:", cam.mode.id, cam.mode.enabled);
  };

  const toggleVisibilityMode = () => {
    // togge between isol
    const viewManager = components?.get(ModelViewManager);
    if (!viewManager) return;
    if (viewManager.VisibilityMode === VisibilityMode.Isolate) viewManager.VisibilityMode = VisibilityMode.Passive;
    else if (viewManager.VisibilityMode === VisibilityMode.Passive) viewManager.VisibilityMode = VisibilityMode.Isolate;
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
          <ButtonGroup variant="contained" style={{ backgroundColor: colors.primary[400], height: "40px" }}>
            <CameraButton />
            <VisibilityPropertiesButton />

            <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

            <Tooltip title="Previous group">
              <Button
                style={{ color: colors.grey[400], border: "0" }}
                variant="contained"
                sx={{
                  backgroundColor: colors.primary[400],
                }}
                onClick={() => setAdjacentGroup("previous")}
              >
                <NavigateBeforeIcon fontSize="large" />
              </Button>
            </Tooltip>
            <Tooltip title="Next group">
              <Button
                style={{ color: colors.grey[400], border: "0" }}
                variant="contained"
                sx={{
                  backgroundColor: colors.primary[400],
                }}
                onClick={() => setAdjacentGroup("next")}
              >
                <NavigateNextIcon fontSize="large" />
              </Button>
            </Tooltip>

            <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

            <PlanViewButton />
            <Tooltip title="Add comment">
              <CommentIconButton />
            </Tooltip>
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
