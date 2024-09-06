import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
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

const CameraIconPanel: React.FC = () => {
  const components = useComponentsContext();
  const [projectionMode, setProjectionMode] = useState<OBC.CameraProjection>();
  const [navMode, setNavMode] = useState<OBC.NavModeID>();
  const [isCameraUnlocked, setCameraLock] = useState<boolean>();

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

    //cam.controls.

    //cam.projection.onChanged.add(() => setSelectedProjection(cam.projection.current));

    return () => {
      //cam.projection.onChanged.remove(() => setSelectedProjection(cam.projection.current));
    };
  });

  const toggleProjectionMode = () => {
    const cache = components?.get(ModelCache);
    if (!cache || !cache?.world?.camera.controls?.enabled) return;

    setCameraProjection(components, projectionMode === "Perspective" ? "Orthographic" : "Perspective", true);
    setProjectionMode(projectionMode === "Perspective" ? "Orthographic" : "Perspective");
  };

  const toggleNavigationMode = () => {
    const cache = components?.get(ModelCache);
    if (!cache || !cache?.world?.camera.controls?.enabled) return;

    setCameraNavigation(components, navMode === "Orbit" ? "Plan" : "Orbit", true);
    setNavMode(navMode === "Orbit" ? "Plan" : "Orbit");
  };

  const toggleCameraLock = () => {
    // setCameraNavigation(components, navMode === "Orbit" ? "Plan" : "Orbit", true);
    const cache = components?.get(ModelCache);
    if (!cache?.world) return;
    let cam = cache.world.camera as OBC.OrthoPerspectiveCamera;
    if (!cam) return;

    cam.controls.enabled = !isCameraUnlocked;

    setCameraLock(!isCameraUnlocked);
  };

  const cameraControlButtons: IconButtonConfig[] = [
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
      onClick: () => { setOrthogonalView(components, undefined, undefined)},
    },
    {
      icon: <Icon icon="mdi:floor-plan" />,
      color: "primary",
      ariaLabel: "planView",
      tooltip: "Plan view",
      size: "small",
      disabled: !isCameraUnlocked,
      onClick: () => { setPlanView(components)},
    },
  ];

  const cameraViews: IconButtonConfig[] = [
    {
      icon: <Typography>Left</Typography>,
      tooltip: "Left View",
      color: isCameraUnlocked ? "primary" : "success",
      ariaLabel: "LeftView",
      disabled: !isCameraUnlocked,
      size: "small",
      onClick: () => setView(components,'left',undefined),
    },
    {
      icon: <Typography>Right</Typography>,
      tooltip: "Right View",
      color: isCameraUnlocked ? "primary" : "success",
      ariaLabel: "RightView",
      disabled: !isCameraUnlocked,
      size: "small",
      onClick: () => setView(components,'right',undefined),
    },
    {
      icon: <Typography>Front</Typography>,
      tooltip: "Front View",
      color: isCameraUnlocked ? "primary" : "success",
      ariaLabel: "FrontView",
      disabled: !isCameraUnlocked,
      size: "small",
      onClick: () => setView(components,'front',undefined),
    },
    {
      icon: <Typography>Back</Typography>,
      tooltip: "Back View",
      color: isCameraUnlocked ? "primary" : "success",
      ariaLabel: "BackView",
      disabled: !isCameraUnlocked,
      size: "small",
      onClick: () => setView(components,'back',undefined),
    },
  ];

  return (
    <Box
      component="div"
      sx={{
        position: "absolute",
        right: 20,
        top: "50%",
        transform: "translateY(-50%)",
        transition: "right 0.1s ease",
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
