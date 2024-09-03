import React, { useEffect, useState } from "react";
import { Box, SpeedDial, SxProps, Theme, Tooltip } from "@mui/material";
import { Icon } from "@iconify/react";
import IconPanel, { IconButtonConfig } from "./IconPanel";
import { PlanViewButton } from "../actionButtonPanel/src/planViewButton";
import { useComponentsContext } from "../../../context/ComponentsContext";
import {
  setCameraNavigation,
  setCameraProjection,
  setOrthogonalView,
  setPlanView,
} from "../../../utilities/CameraUtilities";
import CameraButton from "../actionButtonPanel/src/cameraButton";
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

  const buttonConfigs: IconButtonConfig[] = [
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
      onClick: () => { if(isCameraUnlocked) setOrthogonalView(components, undefined, undefined)},
    },
    {
      icon: <Icon icon="mdi:floor-plan" />,
      color: "primary",
      ariaLabel: "planView",
      tooltip: "Plan view",
      size: "small",
      disabled: !isCameraUnlocked,
      onClick: () => { if(isCameraUnlocked)setPlanView(components)},
    },
  ];

  return (
    <Box
      component="div"
      sx={{
        position: "absolute",
        right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        transition: "right 0.3s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <IconPanel buttons={buttonConfigs} />
    </Box>
  );
};

export default CameraIconPanel;
