import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, BoxProps, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import IconPanel, { IconButtonConfig } from "./src/IconPanel";
import { useComponentsContext } from "../../../context/ComponentsContext";
import {
  setCameraNavigation,
  setCameraProjection,
  setOrthogonalView,
  setPlanView,
  setView,
} from "../../../utilities/CameraUtilities";
import * as OBC from "@thatopen/components";
import { ModelCache } from "../../../bim-components/modelCache";

const CameraIconPanel: React.FC<BoxProps> = ({...props}) => {
  const components = useComponentsContext();
  const [projectionMode, setProjectionMode] = useState<OBC.CameraProjection>();
  const [navMode, setNavMode] = useState<OBC.NavModeID>();
  const [isCameraUnlocked, setCameraLock] = useState<boolean>(true);

  useEffect(() => {
    //get starting properties
    if (!components) return;
    const cache = components?.get(ModelCache);
    if (!cache?.world) return;
    let cam = cache.world.camera as OBC.OrthoPerspectiveCamera;
    if (!cam) return;

    setNavMode(cam.mode.id);
    setProjectionMode(cam.projection.current);
    setCameraLock(cam.controls.enabled);

    return () => {
    };
  }, [components]);


  const toggleProjectionMode = useCallback(() => {
    const cache = components?.get(ModelCache);
    if (!cache || !cache.world?.camera.controls?.enabled) return;

    const newMode = projectionMode === "Perspective" ? "Orthographic" : "Perspective";
    setCameraProjection(components, newMode, true);
    setProjectionMode(newMode);
  }, [components, projectionMode]);



  const toggleNavigationMode = useCallback(() => {
    const cache = components?.get(ModelCache);
    if (!cache || !cache?.world?.camera.controls?.enabled) return;

    setCameraNavigation(components, navMode === "Orbit" ? "Plan" : "Orbit", true);
    setNavMode(navMode === "Orbit" ? "Plan" : "Orbit");
  }, [components, projectionMode]);


  const toggleCameraLock = useCallback(() => {
    // setCameraNavigation(components, navMode === "Orbit" ? "Plan" : "Orbit", true);
    const cache = components?.get(ModelCache);
    if (!cache?.world) return;
    let cam = cache.world.camera as OBC.OrthoPerspectiveCamera;
    if (!cam) return;

    const newSet = !cam.controls.enabled;
    // console.log('cam lock setting', cam.controls.enabled,newSet)
    cam.controls.enabled = newSet;
    // console.log('cam lock set', cam.controls.enabled)

    setCameraLock(newSet);

  }, [components, projectionMode]);

  const cameraControlButtons = useMemo<IconButtonConfig[]>(() => [
    {
      icon: isCameraUnlocked ? <Icon icon="mdi:camera-lock-open-outline" /> : <Icon icon="mdi:camera-lock-outline" />,
      tooltip: isCameraUnlocked ? "Lock Camera" : "Unlock Camera",
      color: isCameraUnlocked ? "primary" : "warning",
      ariaLabel: "capture",
      size: "small",
      onClick: () => toggleCameraLock(),
    },
    {
      icon: navMode === "Orbit" ? <Icon icon="lucide:rotate-3d" /> : <Icon icon="tabler:arrows-move" />,
      tooltip: navMode === "Orbit" ? "Switch to Pan" : "Switch to Orbit",
      color: isCameraUnlocked ? "primary" : "success",
      ariaLabel: "Camera Navigation Mode",
      disabled: !isCameraUnlocked,
      size: "small",
      onClick: () => toggleNavigationMode(),
    },
    {
      icon: projectionMode === "Perspective" ? <Icon icon="iconoir:face-3d-draft" /> : <Icon icon="gis:cube-3d" />,
      color: "primary",
      ariaLabel: projectionMode === "Perspective" ? "Switch to Orthographic" : "Switch to Perspective",
      size: "small",
      disabled: !isCameraUnlocked,
      tooltip: projectionMode === "Perspective" ? "Switch to Orthographic" : "Switch to Perspective",
      onClick: () => toggleProjectionMode(),
    },
    {
      icon: <Icon icon="solar:box-minimalistic-outline" />,
      color: "primary",
      ariaLabel: "orthoView",
      size: "small",
      tooltip: "Orthogonal view",
      disabled: !isCameraUnlocked,
      onClick: () => { setOrthogonalView(components, undefined, undefined) },
    },
    {
      icon: <Icon icon="mdi:floor-plan" />,
      color: "primary",
      ariaLabel: "planView",
      tooltip: "Plan view",
      size: "small",
      disabled: !isCameraUnlocked,
      onClick: () => { setPlanView(components) },
    },
  ], [isCameraUnlocked, projectionMode, navMode, components]);



  const cameraViews = useMemo<IconButtonConfig[]>(() => [
    {
      icon: <Typography>Left</Typography>,
      tooltip: "Left View",
      color: isCameraUnlocked ? "primary" : "success",
      ariaLabel: "LeftView",
      disabled: !isCameraUnlocked,
      size: "small",
      onClick: () => setView(components, 'left', undefined),
    },
    {
      icon: <Typography>Right</Typography>,
      tooltip: "Right View",
      color: isCameraUnlocked ? "primary" : "success",
      ariaLabel: "RightView",
      disabled: !isCameraUnlocked,
      size: "small",
      onClick: () => setView(components, 'right', undefined),
    },
    {
      icon: <Typography>Front</Typography>,
      tooltip: "Front View",
      color: isCameraUnlocked ? "primary" : "success",
      ariaLabel: "FrontView",
      disabled: !isCameraUnlocked,
      size: "small",
      onClick: () => setView(components, 'front', undefined),
    },
    {
      icon: <Typography>Back</Typography>,
      tooltip: "Back View",
      color: isCameraUnlocked ? "primary" : "success",
      ariaLabel: "BackView",
      disabled: !isCameraUnlocked,
      size: "small",
      onClick: () => setView(components, 'back', undefined),
    },
  ], [isCameraUnlocked, projectionMode, navMode, components]);

  return (
    <Box
      component="div"
      sx={{
        ...props.sx,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <IconPanel buttons={cameraControlButtons} />
      <IconPanel buttons={cameraViews} />
    </Box>
  );
};

export default CameraIconPanel;
