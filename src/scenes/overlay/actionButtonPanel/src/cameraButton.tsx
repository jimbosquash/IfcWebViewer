import React, { useEffect, useState } from "react";
import {
  Button,
  Tooltip,
  Popover,
  Box,
  ToggleButton,
  Typography,
  Paper,
  Divider,
  useTheme,
  IconButton,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CameraIndoor from "@mui/icons-material/CameraIndoor";
import * as OBC from "@thatopen/components";

import { useComponentsContext } from "../../../../context/ComponentsContext";
import { ModelCache } from "../../../../bim-components/modelCache";
import {
  BackHand,
  BorderAll,
  CameraOutdoor,
  Cameraswitch,
  Help,
  HelpCenterOutlined,
  HelpSharp,
  QuestionMark,
} from "@mui/icons-material";
import { tokens } from "../../../../theme";
import StyledToggleButtonGroup from "../../../../components/StyledToggleButtonGroup";
import { Icon } from "@iconify/react";

type projectionType = "Orthographic" | "Perspective";
type NavigationType = "Orbit" | "Plan";

const CameraButton = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedNavigation, setSelectedNavigation] = useState<NavigationType | null>();
  const [selectedProjection, setSelectedProjection] = useState<projectionType | null>();

  useEffect(() => {
    //get starting properties
    if (!components) return;
    const cache = components?.get(ModelCache);
    if (!cache?.world) return;
    let cam = cache.world.camera as OBC.OrthoPerspectiveCamera;
    if (!cam) return;

    console.log("mode", cam.mode.id);
    setSelectedNavigation(cam.mode.id as NavigationType);
    setSelectedProjection(cam.projection.current);
    console.log("Orientation", cam.projection.current);

    cam.projection.onChanged.add(() => setSelectedProjection(cam.projection.current));

    return () => {
      cam.projection.onChanged.remove(() => setSelectedProjection(cam.projection.current));
    };
  });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  const handleProjection = (event: React.MouseEvent<HTMLElement>, newProjection: projectionType | null) => {
    console.log("new projection", newProjection);
    setSelectedProjection(newProjection);
    if (!newProjection) return;
    setCameraProjection(newProjection);
    handleClose();
  };

  const handleNavigation = (event: React.MouseEvent<HTMLElement>, newNavigation: NavigationType | null) => {
    if (!newNavigation) return;
    console.log("new Navigation", newNavigation);
    setSelectedNavigation(newNavigation);
    setCameraNavigation(newNavigation);
    handleClose();
  };

  const setCameraNavigation = (newMode: NavigationType) => {
    const cache = components?.get(ModelCache);
    if (!cache?.world) return;
    let cam = cache.world.camera as OBC.OrthoPerspectiveCamera;
    console.log("cam mode setting:", newMode);

    if (newMode === "Orbit") {
      cam.set("Orbit" as OBC.NavModeID);
    } else if (newMode === "Plan") {
      cam.set("Plan" as OBC.NavModeID);
    }
    cam.controls.camera.up.set(0, 1, 0);
    cam.controls.updateCameraUp();
  };

  const setCameraProjection = (newMode: projectionType) => {
    const cache = components?.get(ModelCache);
    if (!cache?.world) return;
    let cam = cache.world.camera as OBC.OrthoPerspectiveCamera;

    if (cam.projection.current === newMode) return;

    console.log("cam mode setting:", newMode);

    if (newMode === "Orthographic") {
      cam.set("Orbit" as OBC.NavModeID);
      cam.projection.set("Orthographic");
    } else if (newMode === "Perspective") {
      cam.projection.set("Perspective");
      cam.set("Orbit" as OBC.NavModeID);
    }
    cam.controls.camera.up.set(0, 1, 0);
    cam.controls.updateCameraUp();

    zoomAll();
  };

  const zoomAll = () => {
    if (!components) return;
    const cache = components.get(ModelCache);
    if (!cache.world) return;

    setTimeout(async () => {
      if (!cache.world?.meshes || cache.world.meshes.size === 0) return;
      let cam = cache.world.camera as OBC.OrthoPerspectiveCamera;
      cam.fit(cache.world?.meshes, 0.5);
    }, 50);
  };

  // const open = Boolean(anchorEl);
  const id = open ? "camera-popover" : undefined;

  return (
    <>
      <Tooltip title="Camera Options">
        <Button
          onClick={handleClick}
          style={{ color: colors.grey[200], backgroundColor: "transparent", border: "0" }}
          variant="contained"
        >
          <CameraAltIcon />
        </Button>
      </Tooltip>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        marginThreshold={90}
      >
        <Paper sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <Box component={"div"} sx={{ display: "flex", flexDirection: "column", alignItems: "top" }}>
            <IconButton size="small" sx={{ alignSelf: "top" }}>
              <HelpSharp />
            </IconButton>
            {/* <Typography color="main" variant="caption" sx={{ mt: 0 }}>
              PROJECTION
            </Typography> */}
          </Box>

          <Box component={"div"} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <StyledToggleButtonGroup
              aria-label="Small sizes"
              exclusive
              size="small"
              value={selectedProjection}
              onChange={handleProjection}
            >
              <Tooltip title="Orthographic">
                <ToggleButton
                  selected={selectedProjection === "Orthographic"}
                  size="small"
                  value="Orthographic"
                  aria-label="left aligned"
                  color="secondary"
                >
                  <Icon icon="icon-park-outline:stereo-perspective" />{" "}
                </ToggleButton>
              </Tooltip>

              <Tooltip title="Perspective">
                <ToggleButton
                  selected={selectedProjection === "Perspective"}
                  size="small"
                  value="Perspective"
                  aria-label="right aligned"
                  color="secondary"
                >
                  <Icon icon="ph:perspective-bold" />{" "}
                </ToggleButton>
              </Tooltip>
            </StyledToggleButtonGroup>

            <Typography color="main" variant="caption" sx={{ mt: 0 }}>
              PROJECTION
            </Typography>
          </Box>

          <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

          <Box component={"div"} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <StyledToggleButtonGroup
              aria-label="Small sizes"
              exclusive
              size="small"
              value={selectedNavigation}
              onChange={handleNavigation}
            >
              <Tooltip title="Plan">
                <ToggleButton
                  selected={selectedNavigation === "Plan"}
                  size="small"
                  value="Plan"
                  aria-label="left aligned"
                  color="secondary"
                >
                  <CameraOutdoor />
                </ToggleButton>
              </Tooltip>

              <Tooltip title="Orbit">
                <ToggleButton
                  selected={selectedNavigation === "Orbit"}
                  size="small"
                  value="Orbit"
                  aria-label="right aligned"
                  color="secondary"
                >
                  <BackHand />
                </ToggleButton>
              </Tooltip>
            </StyledToggleButtonGroup>
            <Typography color="main" variant="caption" sx={{ mt: 0 }}>
              ORIENTATION
            </Typography>
          </Box>

          {/* <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} /> */}
        </Paper>
      </Popover>
    </>
  );
};

export default CameraButton;
