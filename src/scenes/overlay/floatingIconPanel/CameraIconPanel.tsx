import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, BoxProps, SpeedDial, SpeedDialAction, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import IconPanel from "./src/IconPanel";
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
import { IconButtonConfig } from "../../../components/floatingIconButton";
import { ConfigurationManager } from "../../../bim-components/configManager";
import SpeedDialIconButton from "./src/SpeedDialIconButton";

const FloatingCameraPanel: React.FC<BoxProps> = ({ ...props }) => {
  const components = useComponentsContext();
  const [projectionMode, setProjectionMode] = useState<OBC.CameraProjection>();
  const [navMode, setNavMode] = useState<OBC.NavModeID>();
  const [isCameraUnlocked, setCameraLock] = useState<boolean>(true);

  useEffect(() => {
    if (!components) return;
    const cache = components.get(ModelCache);
    const camConfig = components.get(ConfigurationManager).camConfig;

    if (cache.world) {
      console.log('camConfig world and cam found')
      const cam = cache.world.camera as OBC.OrthoPerspectiveCamera;
      if (cam) setCameraLock(cam.controls.enabled);
    }

    setNavMode(camConfig.get('navMode'));
    setProjectionMode(camConfig.get('projection'));
    camConfig.addEventListener("configChanged", (event) => handleConfigChange(event));

    return () => {
      camConfig.removeEventListener("configChanged", (event) => handleConfigChange(event))
    };
  }, [components]);


  const handleConfigChange = (event: Event) => {
    const { key, value, configName } = (event as CustomEvent).detail;
    console.log(`Config ${configName} changed: ${String(key)} = ${value}`);
    switch (key) {
      case 'projection':
        console.log('setting projection icon to', value)
        setProjectionMode(value);
        break;
      case 'navMode':
        console.log('setting navMode icon to', value)
        setNavMode(value);
        break;
    }
  }

  const toggleProjectionMode = useCallback(() => {
    const newMode = projectionMode === "Perspective" ? "Orthographic" : "Perspective";
    setCameraProjection(components, newMode, true);
  }, [components, projectionMode]);

  const toggleNavigationMode = useCallback(() => {
    const newNavMode = navMode === "Orbit" ? "Plan" : "Orbit";
    setCameraNavigation(components, newNavMode, true);
  }, [components, projectionMode, navMode]);

  const toggleCameraLock = useCallback(() => {
    const cache = components?.get(ModelCache);
    if (!cache?.world) return;
    const cam = cache.world.camera as OBC.OrthoPerspectiveCamera;
    if (!cam) return;
    const newSet = !cam.controls.enabled;
    cam.controls.enabled = newSet;

    setCameraLock(newSet);
  }, [components, projectionMode]);

  const cameraControlButtons = useMemo<IconButtonConfig[]>(
    () => [
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
      // {
      //   icon: projectionMode === "Perspective" ? <Icon icon="iconoir:face-3d-draft" /> : <Icon icon="gis:cube-3d" />,
      //   color: "primary",
      //   ariaLabel: projectionMode === "Perspective" ? "Switch to Orthographic" : "Switch to Perspective",
      //   size: "small",
      //   disabled: !isCameraUnlocked,
      //   tooltip: projectionMode === "Perspective" ? "Switch to Orthographic" : "Switch to Perspective",
      //   onClick: () => toggleProjectionMode(),
      // },
      {
        icon: <Icon icon="solar:box-minimalistic-outline" />,
        color: "primary",
        ariaLabel: "orthoView",
        size: "small",
        tooltip: "Orthogonal view",
        disabled: !isCameraUnlocked,
        onClick: () => {
          setOrthogonalView(components, undefined, undefined);
        },
      },

    ],
    [isCameraUnlocked, projectionMode, navMode, components]
  );

  const cameraViews = useMemo<IconButtonConfig[]>(
    () => [
      {
        icon: <Icon icon="mdi:floor-plan" />,
        color: "primary",
        ariaLabel: "planView",
        tooltip: "Plan view",
        size: "small",
        disabled: !isCameraUnlocked,
        onClick: () => {
          setPlanView(components);
        },
      },
      {
        icon: <Typography>Left</Typography>,
        tooltip: "Left View",
        color: isCameraUnlocked ? "primary" : "success",
        ariaLabel: "LeftView",
        disabled: !isCameraUnlocked,
        size: "small",
        onClick: () => setView(components, "left", undefined),
      },
      {
        icon: <Typography>Right</Typography>,
        tooltip: "Right View",
        color: isCameraUnlocked ? "primary" : "success",
        ariaLabel: "RightView",
        disabled: !isCameraUnlocked,
        size: "small",
        onClick: () => setView(components, "right", undefined),
      },
      {
        icon: <Typography>Front</Typography>,
        tooltip: "Front View",
        color: isCameraUnlocked ? "primary" : "success",
        ariaLabel: "FrontView",
        disabled: !isCameraUnlocked,
        size: "small",
        onClick: () => setView(components, "front", undefined),
      },
      {
        icon: <Typography>Back</Typography>,
        tooltip: "Back View",
        color: isCameraUnlocked ? "primary" : "success",
        ariaLabel: "BackView",
        disabled: !isCameraUnlocked,
        size: "small",
        onClick: () => setView(components, "back", undefined),
      },
    ],
    [isCameraUnlocked, projectionMode, navMode, components]
  );

  return (
    <Box
      component="div"
      sx={{
        ...props.sx,
        display: "flex",
        flexDirection: "column",
        alignContent: 'center'
      }}
    >
      <IconPanel buttons={cameraControlButtons} />
      {/* <SpeedDialIconButton mainIcon={<Icon icon="material-symbols:photo-camera-outline" />} buttons={cameraViews} /> */}
      <SpeedDial
        ariaLabel="Speed Dial"
        icon={<Icon icon="material-symbols:photo-camera-outline" />}
        direction="down" // Adjust the direction as needed
        sx={{ position: "absolute", bottom: "40%", right: -6 }}
      >
        {cameraViews.map((button, index) => (
          <SpeedDialAction
            key={index}
            icon={button.icon}
            // tooltipTitle={button.tooltip}
            // tooltipOpen
            onClick={button.onClick}
            FabProps={{
              color: button.color,
              disabled: button.disabled,
              size: button.size,
              sx: button.sx,
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default FloatingCameraPanel;
